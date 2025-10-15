import { Router } from "express";
import { deleteCompanies, getAllCompanies, insertCompanies, updateCompanies } from "../controllers/Companies/Companies";

export const companiesRouter = Router()

//GET Companies
companiesRouter.get("/empresas", getAllCompanies);
//POST Companies
companiesRouter.post("/createcompanies", insertCompanies);
companiesRouter.post("/actualizarcompanie", updateCompanies);
companiesRouter.post("/deletecompanies/:id", deleteCompanies);
