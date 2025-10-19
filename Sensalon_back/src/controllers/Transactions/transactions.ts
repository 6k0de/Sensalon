
import { Request, Response } from "express";
import { TransactionModel } from "../../bd/models/Transaction.model";
import { Users } from "../../bd/models/Users.model";
import { applyCreditPayment } from "../../helpers/applyCreditPayment";
import { applyCashback } from "../../helpers/applyCashback";
import { handleEmails } from "../../helpers/handleEmails";
import { saveFailedTransaction } from "../../middlewares/transactionFailure";
import { approveOrderById } from "../../helpers/approveOrderDiscountProducts";

export const GetAllTransactions = async (_: Request, res: Response) => {
    try {
        const transactions = await TransactionModel.findAll({
            include: [{
                model: Users,
                as: 'user', // Asegúrate de que el alias 'user' coincide con el definido en las asociaciones
                attributes: ['vcusername'] // Especifica aquí los atributos que quieres obtener del usuario
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
