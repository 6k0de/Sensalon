import { Router } from "express";
import { getCreditById, getCreditPayById } from "../controllers/Credits/credits";

export const creditsRouter = Router()

//GET Credits
creditsRouter.get('/credit/:id', getCreditById);

//GET CreditPay
creditsRouter.get('/creditpay/:id', getCreditPayById);