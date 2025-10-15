import MercadoPagoConfig, { Preference } from "mercadopago"
import dotenv from "dotenv"
import { Request, Response } from "express"
import { validateOrCreateShipping } from "./validateAddres"
import { CartItem } from "../../interfaces/Product"
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
import { Vexor } from "vexor"
import {vexor} from '../../lib/vexor'
dotenv.config()

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
})
export const createOrderMercadoPago = async (req: Request, res: Response) => {
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

        const preOrder = await CreateOrderPending.create({
            iIdUser: idUser,
            iIdShippingAddress: finalShippingaddresId,
            products: products.map((p: { product: { iIdProduct: any; vcname: any; iFIdCompany: any }; total: number; quantity: number }) => ({
                id: p.product.iIdProduct,
                name: p.product.vcname,
                price: p.total / p.quantity,
                quantity: p.quantity,
                total: p.total,
                companyId: p.product.iFIdCompany,
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
                    success: `http://localhost:3000/payments/success?orderId=${preOrderGenerateId}`,
                    failure: `http://localhost:3000/payments/failure?orderId=${preOrderGenerateId}`,
                    pending: `http://localhost:3000/payments/pending?orderId=${preOrderGenerateId}`,
                },
                //auto_return: "approved",
                external_reference: String(preOrderGenerateId),
                metadata: { idUser, shippingAddressId: finalShippingaddresId }
            },
        }); 

        /* const paymentResponse = await vexor.pay.mercadopago({
            items
        })

        console.log(paymentResponse) */

        return res.status(200).json({
            init_point: response.sandbox_init_point,
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
            to: "borrelizzy@gmail.com", //pedidos@sensalon.com.mx, 
            subject: `Nueva Orden de Compra - ${transaction.getDataValue('iIdTransaction')}`,
            html: htmlContent,
        });

        return res.status(200).json({
            message: "Orden creada correctamente",
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