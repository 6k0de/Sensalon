import { Router } from "express";
import { getAllServices } from "../controllers/Services/Services";

export const servicesRouter = Router()

//GET Services
servicesRouter.get("/services", getAllServices);