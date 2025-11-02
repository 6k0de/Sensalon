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

dotenv.config()

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!, //MERCADO_PAGO_ACCESS_TOKEN
})

const RESERVATION_TTL_HOURS = 24;

export const createOrderMercadoPago = async (req: Request, res: Response) => {
    const BASE_URL_BACK_PROD = 'api.sensalon.com.mx/payments'
    //const BASE_URL_BACK_PREPROD = 'test-api.sensalon.com.mx/payments'
    /* const BASE_URL_BACK_DEV = '' */
    try {
        const { products, email, idUser, shipping, addCredit, credit, useCashback, cashback, envio } = req.body
        let finalShippingaddresId = await validateOrCreateShipping(shipping, idUser)

        const items = products.map(({ product, quantity, total }: CartItem) => {
            if (!product?.iIdProduct || !product?.vcname || !quantity || !total) {
                throw new Error("Datos de producto incompletos");
            }

            const unit_price = total / quantity
            let categoryId = 'Belleza y cuidado del cuerpo'
            try {
                const categoryData = JSON.parse(product.vccategories || "{}");
                categoryId = categoryData?.Categorias?.[0]?.idCategoria || "Belleza";
            } catch { }

            return {
                id: String(product.iIdProduct),
                title: product.vcname.trim(),
                description: product.vcdescription?.substring(0, 256) || "",
                category_id: categoryId,
                quantity,
                currency_id: "MXN",
                unit_price,
                ...(product.vcphoto ? { picture_url: product.vcphoto } : {}),
            };
        })

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
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const subtotal = products.reduce((acc: number, p: any) => acc + p.total, 0);
        const shippingValue = envio || 0;
        const cashbackValue = useCashback ? cashback : 0;
        const creditValue = addCredit ? credit : 0;
        const total = subtotal + shippingValue - cashbackValue - creditValue;
        console.log(products)
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
                image: p.product.vcphoto
            })),
            subtotal,
            shipping: shippingValue,
            cashback: cashbackValue,
            credit: creditValue,
            total,
            status: "pending"
        })

        const preOrderGenerateId = preOrder.getDataValue('iIdOrderPending')
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
                metadata: { idUser, shippingAddressId: finalShippingaddresId }
            },
        });


        return res.status(200).json({
            init_point: response.init_point,
            preferenceId: response.id
        })

    } catch (error) {
        console.error("Error al crear la orden:", error);
        return res.status(500).json({ error: "Hubo un error al procesar el pago" });
    }
}

export const createOrderTransfer = async (req: Request, res: Response) => {
    const { products, idUser, shipping, addCredit, credit, useCashback, cashback, envio } = req.body;
    const file = req.file;

    if (!idUser || !products || products.length === 0) {
        return res.status(400).json({ error: "Usuario y productos son obligatorios." });
    }
    if (!file) {
        return res.status(400).json({ error: "El comprobante de transferencia es obligatorio." });
    }

    const productsArr = JSON.parse(products)
    const formattedProducts = formatProducts(productsArr)
    const t = await conn.transaction()
    console.log(formattedProducts)
    try {
        const finalShippingaddresId = await validateOrCreateShipping(shipping, idUser)

        const user = await Users.findOne({ where: { iIdUser: idUser } });
        const rolePriceMap: Record<string, string> = {
            '542c2e4e-7177-11ef-a9b1-0050563b': 'decprice1',
            '542c325b-7177-11ef-a9b1-0050563b': 'decprice2',
            '8337416f-7177-11ef-a9b1-0050563b': 'decprice3',
        }

        const priceKey = rolePriceMap[user?.dataValues.iFIdRole || ''] || 'decprice3'

        const { subtotal, total } = calculateTotals({
            products: productsArr,
            priceKey,
            addCredit,
            credit,
            useCashback,
            cashback,
            envio,
        });
        console.log(subtotal, total)
        console.log({
            iIdUser: idUser,
            iIdShippingAddress: finalShippingaddresId,
            products: formattedProducts,
            subtotal,
            shipping: envio,
            cashback: cashback,
            credit: credit,
            total,
            status: "pending"
        })

        const preOrder = await CreateOrderPending.create({
            iIdUser: idUser,
            iIdShippingAddress: finalShippingaddresId,
            products: formattedProducts,
            subtotal,
            shipping: envio,
            cashback: cashback,
            credit: credit,
            total,
            status: "pending"
        })

        const preOrderGenerateId = preOrder.getDataValue('iIdOrderPending')
        console.log(preOrderGenerateId)

        console.log(productsArr)
        const productdIds = productsArr.map((p: any) => p.product.iIdProduct)
        console.log(productdIds)
        const productsBD = await Products.findAll({
            where: { iIdProduct: { [Op.in]: productdIds } },
            transaction: t
        })
        console.log(productsBD)



        const reservations = await InventoryReservationModel.findAll({
            attributes: ['productId', [conn.fn('SUM', conn.col('qty')), 'qty']],
            where: {
                productId: { [Op.in]: productdIds },
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
            const pdB = productsBD.find(x => x.getDataValue('iIdProduct') === line.product.iIdProduct)
            if (!pdB) throw new Error(`Producto no existe: ${line.product.iIdProduct}`)

            const alReadyReserver = reservedMap.get(line.product.iIdProduct) || 0
            const visibleAvailable = (pdB.getDataValue('istock') || 0 - alReadyReserver)

            if (visibleAvailable < line.quantity) {
                throw new Error(`Sin disponibilidad visible para ${pdB.getDataValue('vcname') || line.product.iIdProduct}`);
            }
        }

        const expiresAt = new Date(Date.now() + RESERVATION_TTL_HOURS * 60 * 60 * 1000);

        for (const line of productsArr) {
            await InventoryReservationModel.upsert({
                orderId: String(preOrderGenerateId),
                productId: line.product.iIdProduct,
                qty: line.quantity,
                status: 'reserved',
                expiresAt,
                reason: 'bank-transfer',
                createdAt: new Date(),
            }, { transaction: t });
        }

        const transaction = await TransactionModel.create({
            status: "pending",
            mercadoPagoPaymentId: "",
            amount: total,
            iuserId: idUser,
            iOrderPendingId: preOrderGenerateId,
            ishippingAddressId: finalShippingaddresId,
            paymentMethod: "Transferencia Bancaria",
            products: formattedProducts,
            urltransferrecipt: `/assets/comprobantetransf/${file.filename}`,
        });

        // 6️⃣ Actualizar crédito y cashback
        if (addCredit && Number(credit) > 0) await Credit.update({ state: 1, totalpayamount: credit }, { where: { iFIdUser: idUser } });
        if (useCashback && Number(cashback) > 0) {
            await CashBack.destroy({ where: { FiIdUser: user?.getDataValue('iIdUser') } });
            user?.setDataValue('cashbackbalance', Math.max(0, user.getDataValue('cashbackbalance') - cashback));
            await user?.save();
        }

        const htmlContent = await buildTransactionHtml(transaction, preOrder, shipping);
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
    const file = req.file;

    if (!idUser) return res.status(400).json({ error: "El usuario es obligatorio." });

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "El monto debe ser válido y mayor a 0." });
    }

    if (!file) return res.status(400).json({ error: "El comprobante es obligatorio." });

    let idTransaction = "";
    try {
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
            urltransferrecipt: `/assets/comprobantetransf/${file.filename}`,
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