import { Router } from "express";
import { createSupplier, deleteSupplier, editSupplier, getAllSuppliers } from "../controllers/Suppliers/supplier";

export const suppliersRouter = Router()

//GET Suppliers
suppliersRouter.get("/suppliers", getAllSuppliers);
//POST Suppliers
suppliersRouter.post("/createsupplier", createSupplier);
//PUT Suppliers
suppliersRouter.put("/updatesupplier/:id", editSupplier);
//DELETE Suppliers
suppliersRouter.delete("/deletesupplier/:id", deleteSupplier);