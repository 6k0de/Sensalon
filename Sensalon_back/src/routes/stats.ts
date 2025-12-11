import { Router } from "express";
import { inventoryByBrand, salesByMonth, topCustomer } from "../controllers/Stats/stats";

export const statsRouter = Router();

statsRouter.get("/stats/sales-by-month", salesByMonth);
statsRouter.get("/stats/top-customer", topCustomer);
statsRouter.get("/stats/inventory-by-brand", inventoryByBrand);
