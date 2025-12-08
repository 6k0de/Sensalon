import { Router } from "express";
import { deleteProduct, getAllProducts, getProductById, getProductsByCompany, getProductSimilar, insertProduct, updateProduct } from "../controllers/Products/Products";
import { uploadImages } from "../middlewares/upload";


export const productsRoute = Router()

//GET Products
productsRoute.get("/productos", getAllProducts);
productsRoute.get("/producto/:id", getProductById);
productsRoute.get("/productosSimilares", getProductSimilar);
productsRoute.get('/productos/empresas/:id', getProductsByCompany)

//POST Products
productsRoute.post("/createproducto", uploadImages.single("vcphoto"), insertProduct);
productsRoute.post("/actualizarproducto", uploadImages.single("vcphoto"), updateProduct);
productsRoute.post("/deleteproduct/:id", deleteProduct);
