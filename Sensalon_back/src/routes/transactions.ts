import { Router } from "express";
import {
    GetAllTransactions,
    GetPendingOrdersWithoutTransaction,
    updateOrderPendingStatus,
} from "../controllers/Transactions/transactions";

export const transactionsRouter = Router()

//GET Transactions 
transactionsRouter.get('/transactions', GetAllTransactions);
//GET Orders pending without transactions
transactionsRouter.get('/orderspending', GetPendingOrdersWithoutTransaction);
//POST update order pending status
transactionsRouter.post('/orderspending/:id/status', updateOrderPendingStatus);
