import { Router } from "express";
import { createWarehouseEntrance, getAllWarehouseEntrance, updateWarehouseEntrance } from "../controllers/Warehouse/Warehouse";

export const warehouseRouter = Router()

warehouseRouter.post('/warehouseEntrance', createWarehouseEntrance)
warehouseRouter.get('/getWarehouseEntrance', getAllWarehouseEntrance)
warehouseRouter.put('/warehouseEntrance/:id', updateWarehouseEntrance)
