// services/approveOrder.ts
import { Op, Transaction } from "sequelize";
import conn from "../bd/config/config";
import { InventoryReservationModel } from "../bd/models/InventoryReservation.model";
import { Products } from "../bd/models/Products.model";
import { CreateOrderPending } from "../bd/models/OrderPending.model";
import { ProductPakcageItemsModel } from "../bd/models/ProductsPackageitemst.model";

export async function approveOrderById(orderId: string) {
  const t = await conn.transaction();
  try {
    // 1) Reservas activas
    const reservations = await InventoryReservationModel.findAll({
      where: {
        orderId,
        status: 'reserved',
        [Op.or]: [
          { expiresAt: { [Op.is]: null } },          
          { expiresAt: { [Op.gt]: new Date() } },  
        ],
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!reservations.length) {
      await t.rollback();
      return { ok: false, message: 'No hay reservas activas para esta orden' };
    }

    // 2) Resolver productos (incluye paquetes) + descontar de forma atómica
    const reservedTotals = new Map<string, number>();
    for (const r of reservations) {
      const productId = String(r.getDataValue('productId') || "");
      const qty = Number(r.getDataValue('qty')) || 0;
      if (!productId || qty <= 0) continue;
      reservedTotals.set(productId, (reservedTotals.get(productId) || 0) + qty);
    }

    const reservedIds = Array.from(reservedTotals.keys());
    const reservedProducts = reservedIds.length
      ? await Products.findAll({
          where: { iIdProduct: { [Op.in]: reservedIds } },
          transaction: t,
        })
      : [];

    const productMap = new Map<string, any>();
    reservedProducts.forEach((p: any) => {
      productMap.set(p.getDataValue('iIdProduct'), p);
    });

    const packageIds = reservedProducts
      .filter((p: any) => p.getDataValue('producttype') === 'PACKAGE')
      .map((p: any) => p.getDataValue('iIdProduct'));

    const packageItems = packageIds.length
      ? await ProductPakcageItemsModel.findAll({
          where: { packageId: { [Op.in]: packageIds } },
          transaction: t,
          raw: true,
        })
      : [];

    const packageItemsByPackage = packageItems.reduce<Record<string, { productId: string; quantity: number }[]>>(
      (acc, item: any) => {
        if (!acc[item.packageId]) acc[item.packageId] = [];
        acc[item.packageId].push({
          productId: String(item.productId),
          quantity: Number(item.quantity) || 1,
        });
        return acc;
      },
      {}
    );

    const discountTotals = new Map<string, number>();

    for (const [productId, qty] of reservedTotals) {
      const product = productMap.get(productId);
      const productType = product?.getDataValue('producttype');

      if (productType === 'PACKAGE') {
        const components = packageItemsByPackage[productId] || [];
        if (!components.length) {
          await t.rollback();
          return {
            ok: false,
            message: `El paquete ${product?.getDataValue('vcname') || productId} no tiene componentes configurados.`,
          };
        }

        for (const item of components) {
          const perPackageQty = item.quantity > 0 ? item.quantity : 1;
          const totalQty = qty * perPackageQty;
          if (totalQty <= 0) continue;
          discountTotals.set(item.productId, (discountTotals.get(item.productId) || 0) + totalQty);
        }
      } else {
        discountTotals.set(productId, (discountTotals.get(productId) || 0) + qty);
      }
    }

    for (const [productId, qty] of discountTotals) {
      // UPDATE ... SET istock = istock - :qty WHERE ... AND istock >= :qty
      const [affected] = await Products.update(
        { istock: conn.literal(`GREATEST(istock - ${qty}, 0)`) },
        {
          where: {
            iIdProduct: productId,
            istock: { [Op.gte]: qty },
          },
          transaction: t,
        }
      );

      if (affected === 0) {
        // No alcanzó el stock, rollback completo
        await t.rollback();
        return { ok: false, message: `Stock insuficiente para producto ${productId}` };
      }
    }

    // 3) Marcar reservas como committed
    await InventoryReservationModel.update(
      { status: 'committed' },
      { where: { orderId, status: 'reserved' }, transaction: t }
    );

    // 4) Orden aprobada/completada
    await CreateOrderPending.update(
      { status: 'completed' },
      { where: { iIdOrderPending: orderId }, transaction: t }
    );
    

    await t.commit();
    return { ok: true, message: 'Orden aprobada, stock descontado' };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}
