import { Router } from "express";
import { deleteCategorie, getAllCategories, insertCategorie, updateCategoria } from "../controllers/Categories/Categories";

export const categoriesRoute = Router()

//GET Categories
categoriesRoute.get("/categorias", getAllCategories);

//POST Categories
categoriesRoute.post("/createcategorie", insertCategorie);
categoriesRoute.post("/actualizarcategoria", updateCategoria);
categoriesRoute.post("/deletecategorie/:id", deleteCategorie);