import multer, { StorageEngine } from "multer";
import path from "path";

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