// services/approveOrder.ts
import { Op, Transaction } from "sequelize";
import conn from "../bd/config/config";
import { InventoryReservationModel } from "../bd/models/InventoryReservation.model";
import { Products } from "../bd/models/Products.model";
import { CreateOrderPending } from "../bd/models/OrderPending.model";

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

    // 2) Verificar stock + descontar de forma atómica
    for (const r of reservations) {
      const productId = r.getDataValue('productId');
      const qty = r.getDataValue('qty');

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
