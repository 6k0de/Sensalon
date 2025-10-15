import { Router } from "express";
import { getCashbackByUserId } from "../controllers/Cashback/cashback";

export const cashbackRouter = Router()

//GET Cashback
cashbackRouter.get('/chasback/:id', getCashbackByUserId);
