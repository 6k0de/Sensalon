import { Router } from "express";
import { createDiscountCode, deleteDiscountCode, getDiscountCodes, updateDiscountCode } from "../controllers/DiscountCode/discountCode";


export const discountCodeRouter = Router()

discountCodeRouter.post('/createDiscount', createDiscountCode)
discountCodeRouter.put('/updateDiscount/:id', updateDiscountCode)
discountCodeRouter.get('/discount-codes', getDiscountCodes)
discountCodeRouter.delete('/discount-codes/:id', deleteDiscountCode)
