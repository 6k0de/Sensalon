import { Router } from "express";
import { getCartItemsByUser, GetIdCartByUser, insertCartItems } from "../controllers/Cart/Cart";

export const cartRouter = Router()

//POST Cart
cartRouter.post("/cart/items", insertCartItems);
// GET Cart Items & Cart
cartRouter.get("/cart/:idUser/items", getCartItemsByUser);
cartRouter.get("/cart/:idUser", GetIdCartByUser);