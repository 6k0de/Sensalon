import { Router } from "express";
import { GetAllTransactions } from "../controllers/Transactions/transactions";

export const transactionsRouter = Router()

//GET Transactions 
transactionsRouter.get('/transactions', GetAllTransactions);