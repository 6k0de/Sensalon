import { Router } from "express";
import { Login, LoginAdmin } from "../controllers/Auth/Login";
import { deleteCompanies, getAllCompanies, insertCompanies, updateCompanies } from "../controllers/Companies/Companies";
import { deleteCategorie, getAllCategories, insertCategorie, updateCategoria } from "../controllers/Categories/Categories";
import multer from "multer";
import path from "path";
import { deleteProduct, getAllProducts, getProductById, getProductSimilar, insertProduct, updateProduct } from "../controllers/Products/Products";
import { getAllRoles } from "../controllers/Roles/Roles";
import { getAllServices } from "../controllers/Services/Services";
import { CreateUser, getAllDistributors, getAllSalons, getAllUsersN } from "../controllers/Users/Users";
import { Register } from "../controllers/Auth/Register";
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../assets/imagenes'));  // Carpeta para guardar las imágenes
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Definir los campos para manejar archivos y logos
const archivos = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'constanciaFiscal') {
        cb(null, path.join(__dirname, '../assets/archivos'));
      } else if (file.fieldname === 'logoSalon') {
        cb(null, path.join(__dirname, '../assets/logos'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  })
});


const upload = multer({ storage });


export const router = Router()

router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  

  router.post('/login', Login)
  router.post('/loginA', LoginAdmin)
  router.post('/register', Register)

  //POST Products
  router.post('/createproducto', upload.single('vcphoto'), insertProduct)
  router.post('/actualizarproducto', upload.single('vcphoto'), updateProduct)
  router.post('/deleteproduct/:id', deleteProduct)

  //POST Categories
  router.post('/createcategorie', insertCategorie)
  router.post('/actualizarcategoria', updateCategoria)
  router.post('/deletecategorie/:id', deleteCategorie)

  //POST Companies
  router.post('/createcompanies', insertCompanies)
  router.post('/actualizarcompanie', updateCompanies)
  router.post('/deletecompanies/:id', deleteCompanies)

  //Post Users
  router.post('/createuser', archivos.fields([{ name: 'constanciaFiscal', maxCount: 1 },  { name: 'logoSalon', maxCount: 1 }]), CreateUser);


  //GET
  router.get('/productos', getAllProducts)
  router.get('/producto/:id', getProductById)
  router.get('/productosSimilares', getProductSimilar)
  router.get('/empresas', getAllCompanies)
  router.get('/categorias', getAllCategories)
  router.get('/roles', getAllRoles)
  router.get('/services', getAllServices)
  //router.get('/usuarios', getAllUsers)
  router.get('/distributors', getAllDistributors)
  router.get('/salons', getAllSalons)
  router.get('/usersn', getAllUsersN)
  router.get('/archivos/:filename', (req, res) => {
    const fileName = req.params.filename;

    // Normalizar la ruta para que coincida con la carpeta correcta
    const filePath = path.resolve(__dirname, '../assets/archivos', fileName); // Ajustar la ruta correcta

    console.log(filePath)
    console.log("Ruta generada:", filePath); // Para depuración

    // Verificar si el archivo existe en la ruta corregida
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        
        // Enviar el archivo
        res.sendFile(filePath);
    } else {
        console.log("Archivo no encontrado:", filePath); // Para depuración
        res.status(404).send('Archivo no encontrado');
    }
});



  