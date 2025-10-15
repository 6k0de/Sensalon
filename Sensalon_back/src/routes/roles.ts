import { Router } from "express";
import { getAllRoles } from "../controllers/Roles/Roles";

export const roleRouter = Router()

//GET Roles
roleRouter.get("/roles", getAllRoles);