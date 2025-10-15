import { Router } from "express";
import { CreateShippingAddress, DeleteShipping, GetShippingAddressById } from "../controllers/ShippingAddress/shipping";

export const shippingRouter = Router()

//GET Shipping
shippingRouter.get('/shippingaddres/:id', GetShippingAddressById);
//POST Shipping
shippingRouter.post('/createshipping/:id', CreateShippingAddress);
//DELETE Shipping
shippingRouter.delete('/deleteshipping/:id', DeleteShipping);