
import { Request, Response } from "express";
import { TransactionModel } from "../../bd/models/Transaction.model";
import { Users } from "../../bd/models/Users.model";
import { CreateOrderPending } from "../../bd/models/OrderPending.model";
import { ShippingAddresModel } from "../../bd/models/ShippingAdd.model";
import { CashBack } from "../../bd/models/Cashback.model";
import { Credit } from "../../bd/models/Credits.model";
import { applyCreditPayment } from "../../helpers/applyCreditPayment";
import { applyCashback } from "../../helpers/applyCashback";
import { handleEmails } from "../../helpers/handleEmails";
import { saveFailedTransaction } from "../../middlewares/transactionFailure";
import { approveOrderById } from "../../helpers/approveOrderDiscountProducts";
import { InventoryReservationModel } from "../../bd/models/InventoryReservation.model";
import { registerDiscountCodeUsageFromPreOrder } from "../../helpers/discountCodeAplication";
import { buildTransactionHtml } from "../../helpers/buildTransactionHtml";
import { transporter } from "../nodemailer/config";

const normalizeValue = (value: unknown) => String(value || "").toLowerCase();

const detectPaymentMethod = (products: any) => {
    let raw = products;
    try {
        if (typeof raw === "string") {
            raw = JSON.parse(raw);
            if (typeof raw === "string") {
                raw = JSON.parse(raw);
            }
        }
    } catch {
        return "MercadoPago";
    }

    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    const methodRaw = items.find((item: any) => item?.method)?.method || "";
    const method = String(methodRaw).toLowerCase();

    if (method.includes("transfer")) return "Transferencia Bancaria";
    if (method.includes("mercado")) return "MercadoPago";
    return "MercadoPago";
};

export const GetAllTransactions = async (_: Request, res: Response) => {
    try {
        const transactions = await TransactionModel.findAll({
            include: [{
                model: Users,
                as: 'user', // Asegúrate de que el alias 'user' coincide con el definido en las asociaciones
                attributes: ['vcfirstname', 'vclastname'] // Especifica aquí los atributos que quieres obtener del usuario
            }]
        });
        if (transactions.length > 0) {
            res.status(200).json(transactions);
        }
        else {
            res.status(404).json({ value: 1, message: 'No se encontraron transacciones' });
        }
    }
    catch (error) {
        console.error('error al obtener las transacciones');
        res.status(500).json({ value: 1, message: 'Error del servidor al obtener las transacciones', error });
    }
};

export const updateStatusTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const transaction = await TransactionModel.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        const user = await Users.findByPk(transaction.dataValues.iuserId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 🟢 Caso: Pago de crédito (TBC)
        if (transaction.dataValues.paymentMethod === "TBC" && status === "approved") {
            console.log("Pago de crédito (TBC) aprobado");
            await applyCreditPayment(transaction, user);
        }

        // 🟢 Caso: Pago normal con transferencia
        if (transaction.dataValues.paymentMethod === "Transferencia Bancaria" && status === "approved") {
            await approveOrderById(String(transaction.getDataValue('iOrderPendingId')));
            await applyCashback(transaction, user);
            await handleEmails(transaction, user, true);
        }

        // 🟢 Caso: Pago con MercadoPago aprobado (por si se actualiza vía webhook/admin)
        if (transaction.dataValues.paymentMethod === "MercadoPago" && status === "approved") {
            await approveOrderById(String(transaction.getDataValue('iOrderPendingId')));
        }

        // Actualizar status
        await TransactionModel.update(
            { status },
            { where: { iIdTransaction: id } }
        );

        return res.status(200).json({ message: "Transacción actualizada correctamente" });
    } catch (error: any) {
        console.error("❌ Error en updateStatusTransaction:", error);
        await saveFailedTransaction({
            idTransaction: req.params.id,
            errorMessage: error.message || "Error desconocido",
            errorStack: error.stack || "Sin detalles",
        });
        return res.status(500).json({ message: "Error actualizando transacción", error: error.message });
    }
};

export const GetPendingOrdersWithoutTransaction = async (_: Request, res: Response) => {
    try {
        console.log('entro')
        const orders = await CreateOrderPending.findAll({
            include: [{
                model: Users,
                as: "user",
                attributes: ["vcfirstname", "vclastname", "vcemail"],
            }],
            order: [["createdAt", "DESC"]],
        });

        if (!orders.length) {
            return res.status(200).json([]);
        }

        const orderIds = orders
            .map((order) => Number(order.getDataValue("iIdOrderPending")))
            .filter((id) => Number.isFinite(id));

        const existingTransactions = orderIds.length
            ? await TransactionModel.findAll({
                attributes: ["iOrderPendingId"],
                where: { iOrderPendingId: orderIds },
            })
            : [];

        const existingOrderIds = new Set(
            existingTransactions
                .map((tx) => Number(tx.getDataValue("iOrderPendingId")))
                .filter((id) => Number.isFinite(id))
        );

        const pendingWithoutTransaction = orders.filter(
            (order) => !existingOrderIds.has(Number(order.getDataValue("iIdOrderPending")))
        );

        return res.status(200).json(pendingWithoutTransaction);
    } catch (error) {
        console.error("Error al obtener órdenes pendientes:", error);
        return res.status(500).json({
            message: "Error del servidor al obtener órdenes pendientes",
            error,
        });
    }
};

export const updateOrderPendingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const orderId = Number(id);
        if (!Number.isFinite(orderId)) {
            return res.status(400).json({ message: "Id de orden inválido" });
        }

        const nextStatus = normalizeValue(status);
        if (!["pending", "completed", "failed"].includes(nextStatus)) {
            return res.status(400).json({ message: "Estatus inválido" });
        }

        const preOrder = await CreateOrderPending.findOne({
            where: { iIdOrderPending: orderId },
        });
        if (!preOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const currentStatus = normalizeValue(preOrder.getDataValue("status"));

        if (nextStatus === "failed") {
            await InventoryReservationModel.update(
                { status: "released" },
                { where: { orderId: String(orderId), status: "reserved" } }
            );
            await preOrder.update({ status: "failed" });
            return res.status(200).json({ message: "Orden marcada como error" });
        }

        if (nextStatus === "pending") {
            await preOrder.update({ status: "pending" });
            return res.status(200).json({ message: "Orden marcada como pendiente" });
        }

        const existingTransaction = await TransactionModel.findOne({
            where: { iOrderPendingId: orderId },
            order: [["createdAt", "DESC"]],
        });

        if (existingTransaction) {
            if (normalizeValue(existingTransaction.getDataValue("status")) !== "approved") {
                await existingTransaction.update({ status: "approved" });
            }
            await preOrder.update({ status: "completed" });
            return res.status(200).json({
                message: "Orden actualizada; transacción existente aprobada",
                transactionId: existingTransaction.getDataValue("iIdTransaction"),
            });
        }

        const user = await Users.findByPk(preOrder.getDataValue("iIdUser"));
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const amount = Number(preOrder.getDataValue("total") ?? preOrder.getDataValue("subtotal") ?? 0);
        const paymentMethod = detectPaymentMethod(preOrder.getDataValue("products"));

        const transaction = await TransactionModel.create({
            mercadoPagoPaymentId: "",
            status: "approved",
            amount: amount,
            iuserId: preOrder.getDataValue("iIdUser"),
            iOrderPendingId: orderId,
            ishippingAddressId: preOrder.getDataValue("iIdShippingAddress"),
            merchantOrderId: "",
            paymentMethod,
            products: preOrder.getDataValue("products"),
        });

        const shouldProcess = currentStatus !== "completed";

        if (shouldProcess) {
            const creditValue = Number(preOrder.getDataValue("credit") || 0);
            if (creditValue > 0) {
                const userCredit = await Credit.findOne({
                    where: { iFIdUser: preOrder.getDataValue("iIdUser") },
                });
                if (userCredit) {
                    const current = Number(userCredit.getDataValue("totalpayamount")) || 0;
                    const newTotal = current + creditValue;
                    await Credit.update(
                        { totalpayamount: newTotal, state: 1 },
                        { where: { iIdCredits: userCredit.getDataValue("iIdCredits") } }
                    );
                }
            }

            const cashbackValue = Number(preOrder.getDataValue("cashback") || 0);
            if (cashbackValue > 0) {
                const cash = await CashBack.findOne({
                    where: { FiIdUser: preOrder.getDataValue("iIdUser") },
                });
                if (cash) {
                    const currentAmount = Number(cash.getDataValue("cashbackamount") || 0);
                    const newAmount = Math.max(0, currentAmount - cashbackValue);
                    await CashBack.update(
                        { cashbackamount: newAmount },
                        { where: { iIdCashback: cash.getDataValue("iIdCashback") } }
                    );
                    await Users.update(
                        { cashbackbalance: newAmount },
                        { where: { iIdUser: preOrder.getDataValue("iIdUser") } }
                    );
                }
            }

            await registerDiscountCodeUsageFromPreOrder(preOrder, "approved");

            const approval = await approveOrderById(String(orderId));
            if (!approval.ok && approval.message !== "No hay reservas activas para esta orden") {
                throw new Error(approval.message || "No se pudo descontar stock.");
            }
        }

        await preOrder.update({ status: "completed" });

        const direccion = await ShippingAddresModel.findOne({
            where: { iIdAddressId: preOrder.getDataValue("iIdShippingAddress") },
        });
        const htmlContent = await buildTransactionHtml(
            transaction,
            preOrder,
            direccion?.dataValues
        );
        await transporter.sendMail({
            from: "pedidos@sensalon.com.mx",
            to: "pedidos@sensalon.com.mx",
            subject: `Nueva Orden de Compra - ${transaction.getDataValue("iIdTransaction")}`,
            html: htmlContent,
        });

        return res.status(200).json({
            message: "Orden completada y transacción creada",
            transactionId: transaction.getDataValue("iIdTransaction"),
        });
    } catch (error: any) {
        console.error("❌ Error en updateOrderPendingStatus:", error);
        await saveFailedTransaction({
            ordernum: req.params.id,
            errorMessage: error.message || "Error desconocido",
            errorStack: error.stack || "Sin detalles",
        });
        return res.status(500).json({
            message: "Error actualizando la orden",
            error: error.message,
        });
    }
};
