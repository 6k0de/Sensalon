import MercadoPagoConfig, { Preference } from "mercadopago"
import dotenv from "dotenv"
import { Request, Response } from "express"
import { validateOrCreateShipping } from "./validateAddres"
import { CartItem, Product } from "../../interfaces/Product"
import { Users } from "../../bd/models/Users.model"
import { CreateOrderPending } from "../../bd/models/OrderPending.model"
import { ShippingAddresModel } from "../../bd/models/ShippingAdd.model"
import { TransactionModel } from "../../bd/models/Transaction.model"
import { saveFailedTransaction } from "../../middlewares/transactionFailure"
import { calculateTotals } from "../../helpers/calculeTotals"
import { CashBack } from "../../bd/models/Cashback.model"
import { Credit } from "../../bd/models/Credits.model"
import { buildTransactionHtml } from "../../helpers/buildTransactionHtml"
import { transporter } from "../nodemailer/config"
import { formatProducts } from "../../helpers/formatProducts"
import { Products } from "../../bd/models/Products.model"
import { Op } from "sequelize"
import conn from "../../bd/config/config"
import { InventoryReservationModel } from "../../bd/models/InventoryReservation.model"
import { DiscountCodeModel } from "../../bd/models/DiscountCode.model"
import { ProductPakcageItemsModel } from "../../bd/models/ProductsPackageitemst.model"

dotenv.config()

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!, //MERCADO_PAGO_ACCESS_TOKEN process.env.MERCADO_PAGO_ACCESS_TOKEN!
})

const RESERVATION_TTL_HOURS = 24;
const LOW_STOCK_RECIPIENT = "pedidos@sensalon.com.mx";
const TRANSFER_DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

type LowStockItem = { name: string; remaining: number; threshold: number };

const toSafeNumber = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const normalizeTransferItems = (items: any[] = []) =>
    items
        .map((item) => {
            const id =
                item?.iIdProduct ??
                item?.product?.iIdProduct ??
                item?.id ??
                item?.productId ??
                item?.name ??
                "";
            return {
                id: String(id),
                quantity: toSafeNumber(item?.quantity),
                priceUnit: toSafeNumber(item?.priceUnit ?? item?.unitPrice ?? item?.price),
                total: toSafeNumber(item?.total),
            };
        })
        .sort((a, b) => {
            if (a.id !== b.id) return a.id.localeCompare(b.id);
            if (a.priceUnit !== b.priceUnit) return a.priceUnit - b.priceUnit;
            return a.quantity - b.quantity;
        });

const buildTransferSignature = (
    items: any[],
    meta: any,
    shippingAddressId: any
) => {
    const normalizedMeta = {
        total: toSafeNumber(meta?.total),
        shipping: toSafeNumber(meta?.shipping),
        discount: toSafeNumber(meta?.discount),
        discountCode: meta?.discountCode || null,
        credit: toSafeNumber(meta?.credit),
        cashback: toSafeNumber(meta?.cashback),
    };
    return JSON.stringify({
        items: normalizeTransferItems(items),
        meta: normalizedMeta,
        shippingAddressId: shippingAddressId ? String(shippingAddressId) : "",
    });
};

const parseTransferPayload = (raw: any) => {
    if (!raw) return { items: [], meta: {} };
    let payload = raw;
    if (typeof raw === "string") {
        try {
            payload = JSON.parse(raw);
        } catch {
            return { items: [], meta: {} };
        }
    }
    if (Array.isArray(payload)) return { items: payload, meta: {} };
    if (typeof payload === "object" && payload !== null) {
        return {
            items: Array.isArray((payload as any).items) ? (payload as any).items : [],
            meta: (payload as any).meta || {},
        };
    }
    return { items: [], meta: {} };
};

const findRecentTransferDuplicate = async (
    idUser: string,
    signature: string
) => {
    const windowStart = new Date(Date.now() - TRANSFER_DUPLICATE_WINDOW_MS);
    const candidates = await TransactionModel.findAll({
        where: {
            iuserId: idUser,
            paymentMethod: "Transferencia Bancaria",
            status: "pending",
            createdAt: { [Op.gte]: windowStart },
        },
        order: [["createdAt", "DESC"]],
        limit: 5,
    });

    for (const tx of candidates) {
        const payload = parseTransferPayload(tx.getDataValue("products"));
        const candidateSignature = buildTransferSignature(
            payload.items,
            payload.meta,
            tx.getDataValue("ishippingAddressId")
        );
        if (candidateSignature === signature) {
            return tx;
        }
    }

    return null;
};

const findRecentTransferCreditDuplicate = async (
    idUser: string,
    amount: number
) => {
    const windowStart = new Date(Date.now() - TRANSFER_DUPLICATE_WINDOW_MS);
    return TransactionModel.findOne({
        where: {
            iuserId: idUser,
            paymentMethod: "TBC",
            status: "pending",
            amount,
            createdAt: { [Op.gte]: windowStart },
        },
        order: [["createdAt", "DESC"]],
    });
};

const sendLowStockAlert = async (items: LowStockItem[]) => {
    if (!items.length) return;

    const rows = items
        .map(
            (i) =>
                `<tr><td style="padding:4px 8px;">${i.name}</td><td style="padding:4px 8px;">${i.remaining}</td><td style="padding:4px 8px;">${i.threshold}</td></tr>`
        )
        .join("");

    const html = `
        <p>Se detectaron productos con stock bajo o igual al minimo configurado.</p>
        <table style="border-collapse:collapse;border:1px solid #ccc;">
            <thead>
                <tr>
                    <th style="padding:6px 10px;border:1px solid #ccc;">Producto</th>
                    <th style="padding:6px 10px;border:1px solid #ccc;">Stock restante (estimado)</th>
                    <th style="padding:6px 10px;border:1px solid #ccc;">Stock minimo</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <p>Favor de reabastecer estos productos.</p>
    `;

    try {
        await transporter.sendMail({
            from: LOW_STOCK_RECIPIENT,
            to: LOW_STOCK_RECIPIENT,
            subject: "Alerta de stock bajo",
            html,
        });
    } catch (err) {
        console.error("No se pudo enviar alerta de stock bajo:", err);
    }
};

export const createOrderMercadoPago = async (req: Request, res: Response) => {
    //const BASE_URL_BACK_PROD = 'api.sensalon.com.mx/payments'
    //const BASE_URL_BACK_PREPROD = 'test-api.sensalon.com.mx/payments'
    const BASE_URL_BACK_PROD = 'localhost:3000/payments' // DEV (nota: MercadoPago no puede redirigir a localhost)
    const t = await conn.transaction();
    try {
        const {
            products,
            email,
            idUser,
            shipping,
            addCredit,
            credit,
            useCashback,
            cashback,
            envio,
            discount,
            discountCode,
            subtotal: rawSubtotal,
            subtotalAfterDiscount,
            total: rawTotal,
        } = req.body
        let finalShippingaddresId = await validateOrCreateShipping(shipping, idUser)

        const items = (products ?? []).flatMap((line: any, idx: number) => {
            const pid = line?.product?.iIdProduct;
            const name = line?.product?.vcname;

            const qty = Number(line?.quantity);
            const tot = Number(line?.total);

            if (!pid || !name?.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(tot) || tot < 0) {
                throw new Error(`Producto inválido en index ${idx}`);
            }

            // ✅ Si quedó gratis por cupón, no lo mandes a MP
            if (tot === 0) return [];

            const unit_price = tot / qty;

            let categoryId = "Belleza y cuidado del cuerpo";
            try {
                const categoryData = JSON.parse(line?.product?.vccategories || "{}");
                categoryId = categoryData?.Categorias?.[0]?.idCategoria || "Belleza";
            } catch { }

            return [{
                id: String(pid),
                title: name.trim(),
                description: line?.product?.vcdescription?.substring(0, 256) || "",
                category_id: categoryId,
                quantity: qty,
                currency_id: "MXN",
                unit_price,
                ...(line?.product?.vcphoto ? { picture_url: line.product.vcphoto } : {}),
            }];
        });

        if (addCredit && credit > 0) {
            items.push({ id: "credit", title: "Crédito", quantity: 1, currency_id: "MXN", unit_price: -credit });
        }
        if (useCashback && cashback > 0) {
            items.push({ id: "cashback", title: "Cashback", quantity: 1, currency_id: "MXN", unit_price: -cashback });
        }
        if (envio && envio > 0) {
            items.push({ id: "shipping", title: "Envío", quantity: 1, currency_id: "MXN", unit_price: envio });
        }

        const user = await Users.findOne({ where: { iIdUser: idUser } });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const subtotalFromItems = products.reduce((acc: number, p: any) => acc + Number(p.total || 0), 0);
        const subtotalParsed =
            subtotalAfterDiscount !== undefined && subtotalAfterDiscount !== null
                ? Number(subtotalAfterDiscount)
                : rawSubtotal !== undefined
                    ? Number(rawSubtotal)
                    : subtotalFromItems;

        const shippingValue = Number(envio || 0);
        const cashbackValue = useCashback ? Number(cashback || 0) : 0;
        const creditValue = addCredit ? Number(credit || 0) : 0;
        const totalParsed =
            rawTotal !== undefined && rawTotal !== null
                ? Number(rawTotal)
                : subtotalParsed + shippingValue - cashbackValue - creditValue;

        const preOrder = await CreateOrderPending.create({
            iIdUser: idUser,
            iIdShippingAddress: finalShippingaddresId,
            products: products.map((p: { product: { iIdProduct: string; vcname: string; iFIdCompany: string, vccategories: string, vcphoto: string }; total: number; quantity: number, unitPrice: number }) => ({
                iIdProduct: p.product.iIdProduct,
                name: p.product.vcname,
                priceUnit: p.unitPrice,
                price: p.total / p.quantity,
                quantity: p.quantity,
                total: p.total,
                companyId: p.product.iFIdCompany,
                categoryIds: p.product.vccategories,
                image: p.product.vcphoto,
                discountApplied: Number(discount || 0) > 0 ? Number(discount || 0) : undefined,
                discountCode: discountCode || undefined,
                method: 'Mercado pago'
            })),
            subtotal: subtotalParsed,
            shipping: shippingValue,
            cashback: cashbackValue,
            credit: creditValue,
            total: totalParsed,
            status: "pending"
        }, { transaction: t })

        const preOrderGenerateId = preOrder.getDataValue('iIdOrderPending')

        const productdIds = products.map((p: any) => p.product.iIdProduct)
        const packageIds = products
            .filter((p: any) => p?.product?.producttype === "PACKAGE")
            .map((p: any) => p?.product?.iIdProduct)
            .filter(Boolean);

        const packageItems = packageIds.length
            ? await ProductPakcageItemsModel.findAll({
                where: { packageId: { [Op.in]: packageIds } },
                transaction: t,
                raw: true,
            })
            : [];

        const packageItemsByPackage = packageItems.reduce<Record<string, { productId: string; quantity: number }[]>>((acc, item: any) => {
            if (!acc[item.packageId]) acc[item.packageId] = [];
            acc[item.packageId].push({
                productId: item.productId,
                quantity: Number(item.quantity) || 1,
            });
            return acc;
        }, {});

        const allProductIds = Array.from(new Set([...productdIds, ...packageItems.map((i: any) => i.productId)]));

        const productsBD = await Products.findAll({
            where: { iIdProduct: { [Op.in]: allProductIds }, isactive: 1 },
            transaction: t
        })

        const productMap = new Map<string, any>();
        productsBD.forEach((p: any) => {
            productMap.set(p.getDataValue('iIdProduct'), p);
        });

        const reservations = await InventoryReservationModel.findAll({
            attributes: ['productId', [conn.fn('SUM', conn.col('qty')), 'qty']],
            where: {
                productId: { [Op.in]: allProductIds },
                status: 'reserved',
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: new Date() } },
                ],
            },
            group: ['productId'],
            transaction: t
        })

        const reservedMap = new Map<string, number>()
        reservations.forEach(r => {
            reservedMap.set(r.getDataValue('productId'), Number(r.getDataValue('qty')) || 0)
        })

        for (const line of products) {
            const productId = line?.product?.iIdProduct;
            const requestedQty = Number(line?.quantity) || 0;

            if (!productId || requestedQty <= 0) {
                await t.rollback();
                return res.status(417).json({ message: 'Datos de producto inválidos en la orden.' });
            }

            const pdB = productMap.get(productId);

            if (!pdB) {
                await t.rollback();
                return res.status(417).json({ message: `Producto inexistente: ${line?.product?.vcname || productId}` });
            }

            if (line?.product?.producttype === "PACKAGE") {
                const components = packageItemsByPackage[productId] || [];
                if (!components.length) {
                    await t.rollback();
                    return res.status(417).json({ message: `El paquete ${pdB.getDataValue('vcname')} no tiene componentes configurados.` });
                }

                let maxPackages = Infinity;
                let limitingName = pdB.getDataValue('vcname');

                for (const item of components) {
                    const component = productMap.get(item.productId);
                    if (!component) {
                        await t.rollback();
                        return res.status(417).json({ message: `Componente faltante para el paquete ${pdB.getDataValue('vcname')}.` });
                    }

                    const alreadyReserved = reservedMap.get(item.productId) || 0;
                    const stock = Number(component.getDataValue('istock')) || 0;
                    const perPackageQty = item.quantity > 0 ? item.quantity : 1;
                    const availableUnits = Math.floor(Math.max(0, stock - alreadyReserved) / perPackageQty);

                    if (availableUnits < maxPackages) {
                        maxPackages = availableUnits;
                        limitingName = component.getDataValue('vcname') || limitingName;
                    }
                }

                if (maxPackages < requestedQty) {
                    await t.rollback();
                    return res.status(417).json({ message: `Sin stock suficiente para el paquete ${pdB.getDataValue('vcname')}. Falta inventario del producto ${limitingName}.` });
                }
            } else {
                const alreadyReserved = reservedMap.get(productId) || 0;
                const visibleAvailable = (pdB.getDataValue('istock') || 0) - alreadyReserved;

                if (visibleAvailable < requestedQty) {
                    await t.rollback();
                    return res.status(417).json({ message: `Sin disponibilidad visible para ${pdB.getDataValue('vcname')}` });
                }
            }
        }

        const expiresAt = new Date(Date.now() + RESERVATION_TTL_HOURS * 60 * 60 * 1000);

        const reservationTotals = new Map<string, number>();
        const accumulateReservation = (productId: string, qty: number) => {
            const current = reservationTotals.get(productId) || 0;
            reservationTotals.set(productId, current + qty);
        };

        for (const line of products) {
            const productId = line?.product?.iIdProduct;
            const requestedQty = Number(line?.quantity) || 0;
            if (!productId || requestedQty <= 0) continue;

            if (line?.product?.producttype === "PACKAGE") {
                const components = packageItemsByPackage[productId] || [];
                components.forEach((item) => {
                    const perPackageQty = item.quantity > 0 ? item.quantity : 1;
                    accumulateReservation(item.productId, requestedQty * perPackageQty);
                });
            } else {
                accumulateReservation(productId, requestedQty);
            }
        }

        for (const [productId, qty] of reservationTotals) {
            await InventoryReservationModel.upsert({
                orderId: String(preOrderGenerateId),
                productId,
                qty,
                status: 'reserved',
                expiresAt,
                reason: 'mercadopago',
                createdAt: new Date(),
            }, { transaction: t });
        }

        const lowStockItems: LowStockItem[] = [];
        for (const [productId, qty] of reservationTotals) {
            const product = productMap.get(productId);
            if (!product) continue;

            const stock = Number(product.getDataValue('istock')) || 0;
            const minStock = Number(product.getDataValue('istocklimit')) || 0;
            const existingReserved = reservedMap.get(productId) || 0;
            const remaining = stock - (existingReserved + qty);

            if (minStock > 0 && remaining <= minStock) {
                lowStockItems.push({
                    name: product.getDataValue('vcname'),
                    remaining: Math.max(0, remaining),
                    threshold: minStock,
                });
            }
        }

        await sendLowStockAlert(lowStockItems);
        // 5. Preferencia
        console.log(process?.env?.MERCADO_PAGO_ACCESS_TOKEN)
        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({
            body: {
                items,
                payer: { email: email || user.dataValues.vcemail },
                back_urls: {
                    success: `${BASE_URL_BACK_PROD}/success?orderId=${preOrderGenerateId}`,
                    failure: `${BASE_URL_BACK_PROD}/failure?orderId=${preOrderGenerateId}`,
                    pending: `${BASE_URL_BACK_PROD}/pending?orderId=${preOrderGenerateId}`,
                },
                auto_return: "approved",
                external_reference: String(preOrderGenerateId),
                metadata: {
                    idUser,
                    shippingAddressId: finalShippingaddresId,
                    discount: Number(discount || 0) || 0,
                    discountCode: discountCode || null,
                }
            },
        });
        await t.commit();
        return res.status(200).json({
            init_point: response.init_point,
            preferenceId: response.id
        })

    } catch (error) {
        await t.rollback();
        console.error("Error al crear la orden:", error);
        return res.status(500).json({ error: "Hubo un error al procesar el pago" });
    }
}

export const createOrderTransfer = async (req: Request, res: Response) => {
    const {
        products,
        idUser,
        shipping,
        addCredit,
        credit,
        useCashback,
        cashback,
        envio,
        discount,
        discountCode,
        subtotal: rawSubtotal,
        subtotalAfterDiscount,
        total: rawTotal,
    } = req.body;
    const files = (req.files as Express.Multer.File[] | undefined) || [];

    if (!idUser || !products || products.length === 0) {
        return res.status(400).json({ error: "Usuario y productos son obligatorios." });
    }
    if (!files.length) {
        return res.status(400).json({ error: "El comprobante de transferencia es obligatorio." });
    }

    let productsArr: any[] = [];
    try {
        productsArr = JSON.parse(products);
    } catch {
        return res.status(400).json({ error: "Formato de productos inválido." });
    }

    const formattedProducts = formatProducts(productsArr)
    console.log(formattedProducts)

    let t: any = null;
    try {
        const finalShippingaddresId = await validateOrCreateShipping(shipping, idUser)

        const user = await Users.findOne({ where: { iIdUser: idUser } });
        const rolePriceMap: Record<string, string> = {
            '542c2e4e-7177-11ef-a9b1-0050563b': 'decprice1',
            '542c325b-7177-11ef-a9b1-0050563b': 'decprice2',
            '8337416f-7177-11ef-a9b1-0050563b': 'decprice3',
        }

        const priceKey = rolePriceMap[user?.dataValues.iFIdRole || ''] || 'decprice3'

        const calculated = calculateTotals({
            products: productsArr,
            priceKey,
            addCredit,
            credit,
            useCashback,
            cashback,
            envio,
        });

        const subtotalParsed =
            subtotalAfterDiscount !== undefined && subtotalAfterDiscount !== null
                ? Number(subtotalAfterDiscount)
                : rawSubtotal !== undefined
                    ? Number(rawSubtotal)
                    : calculated.subtotal;

        const totalParsed =
            rawTotal !== undefined && rawTotal !== null
                ? Number(rawTotal)
                : calculated.total;
        const shippingValue = Number(envio || 0);
        const cashbackValue = useCashback ? Number(cashback || 0) : 0;
        const creditValue = addCredit ? Number(credit || 0) : 0;
        const discountValue = Number(discount || 0)

        const orderMeta = {
            rawSubtotal,
            subtotalAfterDiscount: subtotalParsed,
            discount: discountValue,
            discountCode: discountCode || null,
            shipping: shippingValue,
            cashback: cashbackValue,
            credit: creditValue,
            total: totalParsed,
            flags: {
                addCredit: Boolean(addCredit),
                useCashback: Boolean(useCashback),
            },
        };

        const productsPayload = {
            items: formattedProducts,
            meta: orderMeta,
        };

        const transferSignature = buildTransferSignature(
            formattedProducts,
            orderMeta,
            finalShippingaddresId
        );
        const duplicate = await findRecentTransferDuplicate(idUser, transferSignature);
        if (duplicate) {
            return res.status(200).json({
                message: "Orden ya registrada recientemente",
                data: 1,
                orderNumber: duplicate.getDataValue('iIdTransaction'),
            });
        }

        t = await conn.transaction()

        if (discountCode) {
            const discountRow = await DiscountCodeModel.findOne({
                where: { code: discountCode, isActive: true },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!discountRow) {
                await t.rollback();
                return res.status(400).json({ error: "El código de descuento no es válido o está inactivo." });
            }

            // Si es limitado, verificar usos restantes
            if (discountRow.getDataValue('usageLimitType') === "limited") {
                const currentCount = discountRow.getDataValue('usageCount') || 0;
                const maxUses = discountRow.getDataValue('usageLimit') ?? null;

                if (maxUses !== null && currentCount >= maxUses) {
                    await t.rollback();
                    return res.status(400).json({ error: "El código de descuento ya alcanzó el número máximo de usos." });
                }

                // Sumar 1 uso
                await discountRow.update(
                    { usageCount: currentCount + 1 },
                    { transaction: t }
                );
            }
            // Si es "unlimited", no tocamos usageLimit / usageCount (o podrías guardar solo para métricas)
        }


        const preOrder = await CreateOrderPending.create({
            iIdUser: idUser,
            iIdShippingAddress: finalShippingaddresId,
            products: productsPayload,
            subtotal: subtotalParsed,
            shipping: shippingValue,
            cashback: cashbackValue,
            credit: creditValue,
            total: totalParsed,
            status: "pending"
        })

        const preOrderGenerateId = preOrder.getDataValue('iIdOrderPending')
        console.log(preOrderGenerateId)

        console.log(productsArr)
        const productdIds = productsArr.map((p: any) => p.product.iIdProduct)

        const packageIds = productsArr
            .filter((p: any) => p?.product?.producttype === "PACKAGE")
            .map((p: any) => p?.product?.iIdProduct)
            .filter(Boolean);

        const packageItems = packageIds.length
            ? await ProductPakcageItemsModel.findAll({
                where: { packageId: { [Op.in]: packageIds } },
                transaction: t,
                raw: true,
            })
            : [];

        const packageItemsByPackage = packageItems.reduce<Record<string, { productId: string; quantity: number }[]>>((acc, item: any) => {
            if (!acc[item.packageId]) acc[item.packageId] = [];
            acc[item.packageId].push({
                productId: item.productId,
                quantity: Number(item.quantity) || 1,
            });
            return acc;
        }, {});

        const allProductIds = Array.from(new Set([...productdIds, ...packageItems.map((i: any) => i.productId)]));

        const productsBD = await Products.findAll({
            where: { iIdProduct: { [Op.in]: allProductIds }, isactive: 1 },
            transaction: t
        })

        const productMap = new Map<string, any>();
        productsBD.forEach((p: any) => {
            productMap.set(p.getDataValue('iIdProduct'), p);
        });

        const reservations = await InventoryReservationModel.findAll({
            attributes: ['productId', [conn.fn('SUM', conn.col('qty')), 'qty']],
            where: {
                productId: { [Op.in]: allProductIds },
                status: 'reserved',
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: new Date() } },
                ],
            },
            group: ['productId'],
            transaction: t
        })

        const reservedMap = new Map<string, number>()
        reservations.forEach(r => {
            reservedMap.set(r.getDataValue('productId'), Number(r.getDataValue('qty')) || 0)
        })

        for (const line of productsArr) {
            const productId = line?.product?.iIdProduct;
            const requestedQty = Number(line?.quantity) || 0;

            if (!productId || requestedQty <= 0) {
                await t.rollback();
                return res.status(417).json({ message: 'Datos de producto inválidos en la orden.' });
            }

            const pdB = productMap.get(productId);

            if (!pdB) {
                await t.rollback();
                return res.status(417).json({ message: `Producto inexistente: ${line?.product?.vcname || productId}` });
            }

            if (line?.product?.producttype === "PACKAGE") {
                const components = packageItemsByPackage[productId] || [];
                if (!components.length) {
                    await t.rollback();
                    return res.status(417).json({ message: `El paquete ${pdB.getDataValue('vcname')} no tiene componentes configurados.` });
                }

                let maxPackages = Infinity;
                let limitingName = pdB.getDataValue('vcname');

                for (const item of components) {
                    const component = productMap.get(item.productId);
                    if (!component) {
                        await t.rollback();
                        return res.status(417).json({ message: `Componente faltante para el paquete ${pdB.getDataValue('vcname')}.` });
                    }

                    const alreadyReserved = reservedMap.get(item.productId) || 0;
                    const stock = Number(component.getDataValue('istock')) || 0;
                    const perPackageQty = item.quantity > 0 ? item.quantity : 1;
                    const availableUnits = Math.floor(Math.max(0, stock - alreadyReserved) / perPackageQty);

                    if (availableUnits < maxPackages) {
                        maxPackages = availableUnits;
                        limitingName = component.getDataValue('vcname') || limitingName;
                    }
                }

                if (maxPackages < requestedQty) {
                    await t.rollback();
                    return res.status(417).json({ message: `Sin stock suficiente para el paquete ${pdB.getDataValue('vcname')}. Falta inventario del producto ${limitingName}.` });
                }
            } else {
                const alreadyReserved = reservedMap.get(productId) || 0;
                const visibleAvailable = (pdB.getDataValue('istock') || 0) - alreadyReserved;

                if (visibleAvailable < requestedQty) {
                    await t.rollback();
                    return res.status(417).json({ message: `Sin disponibilidad visible para ${pdB.getDataValue('vcname')}` });
                }
            }
        }


        const expiresAt = new Date(Date.now() + RESERVATION_TTL_HOURS * 60 * 60 * 1000);

        const reservationTotals = new Map<string, number>();
        const accumulateReservation = (productId: string, qty: number) => {
            const current = reservationTotals.get(productId) || 0;
            reservationTotals.set(productId, current + qty);
        };

        for (const line of productsArr) {
            const productId = line?.product?.iIdProduct;
            const requestedQty = Number(line?.quantity) || 0;
            if (!productId || requestedQty <= 0) continue;

            if (line?.product?.producttype === "PACKAGE") {
                const components = packageItemsByPackage[productId] || [];
                components.forEach((item) => {
                    const perPackageQty = item.quantity > 0 ? item.quantity : 1;
                    accumulateReservation(item.productId, requestedQty * perPackageQty);
                });
            } else {
                accumulateReservation(productId, requestedQty);
            }
        }

        for (const [productId, qty] of reservationTotals) {
            await InventoryReservationModel.upsert({
                orderId: String(preOrderGenerateId),
                productId,
                qty,
                status: 'reserved',
                expiresAt,
                reason: 'bank-transfer',
                createdAt: new Date(),
            }, { transaction: t });
        }

        const lowStockItems: LowStockItem[] = [];
        for (const [productId, qty] of reservationTotals) {
            const product = productMap.get(productId);
            if (!product) continue;

            const stock = Number(product.getDataValue('istock')) || 0;
            const minStock = Number(product.getDataValue('istocklimit')) || 0;
            const existingReserved = reservedMap.get(productId) || 0;
            const remaining = stock - (existingReserved + qty);

            if (minStock > 0 && remaining <= minStock) {
                lowStockItems.push({
                    name: product.getDataValue('vcname'),
                    remaining: Math.max(0, remaining),
                    threshold: minStock,
                });
            }
        }

        await sendLowStockAlert(lowStockItems);

        const receiptPaths = files.map((f) => `/assets/comprobantetransf/${f.filename}`);

        const transaction = await TransactionModel.create({
            status: "pending",
            mercadoPagoPaymentId: "",
            amount: totalParsed,
            iuserId: idUser,
            iOrderPendingId: preOrderGenerateId,
            ishippingAddressId: finalShippingaddresId,
            paymentMethod: "Transferencia Bancaria",
            products: productsPayload,
            urltransferrecipt: receiptPaths,
        });

        // 6️⃣ Actualizar crédito y cashback
        if (addCredit && creditValue > 0) await Credit.update({ state: 1, totalpayamount: creditValue }, { where: { iFIdUser: idUser } });
        if (useCashback && cashbackValue > 0) {
            await CashBack.destroy({ where: { FiIdUser: user?.getDataValue('iIdUser') } });
            user?.setDataValue('cashbackbalance', Math.max(0, user.getDataValue('cashbackbalance') - cashbackValue));
            await user?.save();
        }

        const htmlContent = await buildTransactionHtml(transaction, preOrder, shippingValue);
        console.log(htmlContent)
        await transporter.sendMail({
            from: "pedidos@sensalon.com.mx",
            to: "pedidos@sensalon.com.mx", // borrelizzy@gmail.com, 
            subject: `Nueva Orden de Compra - ${transaction.getDataValue('iIdTransaction')}`,
            html: htmlContent,
        });

        await t.commit()
        return res.status(200).json({
            message: "Orden y reservaciones creadas correctamente",
            data: 1,
            orderNumber: transaction.getDataValue('iIdTransaction'),
        });
    } catch (error: any) {
        console.error("Error al guardar la transacción:", error);
        if (t) {
            try {
                await t.rollback();
            } catch {}
        }
        await saveFailedTransaction({
            idUser,
            formattedProducts,
            errorMessage: error.message,
            errorStack: error.stack,
        });
        return res.status(500).json({ error: "Error al crear la orden" });
    }

}


export const createOrderTransferPayCredit = async (req: Request, res: Response) => {
    const { idUser, amount } = req.body;
    const files = (req.files as Express.Multer.File[] | undefined) || [];

    if (!idUser) return res.status(400).json({ error: "El usuario es obligatorio." });

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "El monto debe ser válido y mayor a 0." });
    }

    if (!files.length) return res.status(400).json({ error: "El comprobante es obligatorio." });

    let idTransaction = "";
    try {
        const duplicate = await findRecentTransferCreditDuplicate(idUser, parsedAmount);
        if (duplicate) {
            return res.status(200).json({
                message: "Pago ya registrado recientemente",
                orderNumber: duplicate.getDataValue('iIdTransaction'),
                preOrderId: duplicate.getDataValue('iOrderPendingId'),
            });
        }

        const shipping = await ShippingAddresModel.findOne({ where: { iIFIdUser: idUser } });
        const shippingId = shipping?.dataValues?.iIdAddressId || null;

        const preOrder = await CreateOrderPending.create({
            iIdUser: idUser,
            iIdShippingAddress: shippingId!,
            products: [],
            subtotal: parsedAmount,
            shipping: 0,
            cashback: 0,
            credit: parsedAmount,
            total: parsedAmount,
            status: "pending",
        });
        const preOrderGenerateId = preOrder.getDataValue('iIdOrderPending')

        const transaction = await TransactionModel.create({
            mercadoPagoPaymentId: "",
            status: "pending",
            amount: parsedAmount,
            iuserId: idUser,
            ishippingAddressId: shippingId,
            merchantOrderId: "",
            paymentMethod: "TBC",
            products: { Producto: "Pago de crédito mediante transferencia bancaria" },
            urltransferrecipt: files.map((f) => `/assets/comprobantetransf/${f.filename}`),
            cashbackapplied: 0,
            iOrderPendingId: preOrderGenerateId,
        });

        idTransaction = transaction.dataValues.iIdTransaction;

        return res.status(200).json({
            message: "Orden creada correctamente",
            orderNumber: idTransaction,
            preOrderId: preOrder.dataValues.iIdOrderPending,
        });
    } catch (error: any) {
        console.error("Error al guardar la transacción:", error);

        await saveFailedTransaction({
            amount: parsedAmount,
            idUser,
            errorMessage: error.message || "Error desconocido",
            errorStack: error.stack || "Sin detalles",
        });

        const redirectUrl = `${process.env.URL_FRONTEND}/ordenFallida?orderNumber=${idTransaction}`;
        res.setHeader("Location", redirectUrl);
        return res.status(302).end();
    }

}
