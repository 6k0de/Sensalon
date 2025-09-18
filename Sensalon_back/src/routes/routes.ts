import { Router } from "express";
import { Login, LoginAdmin } from "../controllers/Auth/Login";
import {
  deleteCompanies,
  getAllCompanies,
  insertCompanies,
  updateCompanies,
} from "../controllers/Companies/Companies";
import {
  deleteCategorie,
  getAllCategories,
  insertCategorie,
  updateCategoria,
} from "../controllers/Categories/Categories";
import multer, { StorageEngine } from "multer";
import path from "path";
import {
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductSimilar,
  insertProduct,
  updateProduct,
} from "../controllers/Products/Products";
import { getAllRoles } from "../controllers/Roles/Roles";
import { getAllServices } from "../controllers/Services/Services";
import {
  CreateUser,
  deleteUsers,
  deleteUsersDistributor,
  deleteUsersSalon,
  getAllDistributors,
  getAllSalons,
  getAllUsersN,
  UpdateUser,
} from "../controllers/Users/Users";
import { Register } from "../controllers/Auth/Register";
import fs from "fs";
import {
  deleteSliderImage,
  getSliderImages,
  uploadSlider,
} from "../controllers/Slider/slider";

const storageConfig = (folder: string): StorageEngine =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(__dirname, `../assets/${folder}`));
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

// 📸 2. Subida simple de imágenes
export const uploadImages = multer({
  storage: storageConfig("imagenes"),
});

// 🖼️ 3. Almacenamiento específico para slider
const sliderStorage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../assets/slider"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Middleware para subir hasta 10 imágenes (form field: "images")
export const uploadSliderImages = multer({ storage: sliderStorage }).array(
  "images",
  10,
);

// 📂 4. Subida de archivos múltiples (archivos diferentes en un mismo formulario)
export const uploadFiles = multer({
  storage: storageConfig("archivos"),
}).fields([
  { name: "constanciaFiscal", maxCount: 1 },
  { name: "logoSalon", maxCount: 1 },
]);

export const router = Router();

router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
  );
  next();
});

router.post("/login", Login);
router.post("/loginA", LoginAdmin);
router.post("/register", Register);

//POST Products
router.post("/createproducto", uploadImages.single("vcphoto"), insertProduct);
router.post(
  "/actualizarproducto",
  uploadImages.single("vcphoto"),
  updateProduct,
);
router.post("/deleteproduct/:id", deleteProduct);

//POST Categories
router.post("/createcategorie", insertCategorie);
router.post("/actualizarcategoria", updateCategoria);
router.post("/deletecategorie/:id", deleteCategorie);

//POST Companies
router.post("/createcompanies", insertCompanies);
router.post("/actualizarcompanie", updateCompanies);
router.post("/deletecompanies/:id", deleteCompanies);

//GET Users
router.get("/distributors", getAllDistributors);
router.get("/salons", getAllSalons);
router.get("/usersn", getAllUsersN);

//POST Users
router.post("/createuser", uploadFiles, CreateUser);

//PUT Users
router.put("/updateuser", uploadFiles, UpdateUser);

//Delete Users
router.delete("/deleteuser/:id", deleteUsers);
router.delete("/deleteusersalon/:id", deleteUsersSalon);
router.delete("/deleteuserdistributor/:id", deleteUsersDistributor);

//POST Slider
router.post("/slider", uploadSliderImages, uploadSlider);
//GET Slider
router.get("/sliderImage", getSliderImages);
//Delete
router.delete("/sliderImage/:id", deleteSliderImage);

router.get("/productos", getAllProducts);
router.get("/producto/:id", getProductById);
router.get("/productosSimilares", getProductSimilar);
router.get("/empresas", getAllCompanies);
router.get("/categorias", getAllCategories);
router.get("/roles", getAllRoles);
router.get("/services", getAllServices);
//router.get('/usuarios', getAllUsers)

router.get("/archivos/:filename", (req, res) => {
  const fileName = req.params.filename;

  // Normalizar la ruta para que coincida con la carpeta correcta
  const filePath = path.resolve(__dirname, "../assets/archivos", fileName); // Ajustar la ruta correcta

  console.log(filePath);
  console.log("Ruta generada:", filePath); // Para depuración

  // Verificar si el archivo existe en la ruta corregida
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");

    // Enviar el archivo
    res.sendFile(filePath);
  } else {
    console.log("Archivo no encontrado:", filePath); // Para depuración
    res.status(404).send("Archivo no encontrado");
  }
});
