import { Router } from "express";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import {
  getInfoTransfer,
  infoTransferUpdate,
} from "../controllers/Transfer/transfer";
import {
  getDeliveryInfo,
  updateDelivery,
} from "../controllers/Delivery/delivery";

dotenv.config();
export const payment = Router();

payment.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
  );
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets/comprobantetransf")); // Carpeta donde se guardarÃ¡n los archivos
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });

//GET InfoBankAccount
payment.get("/infoTransfer", getInfoTransfer);
//PUT InfoBankAccount
payment.put("/infoTransferUpdate", infoTransferUpdate);

//GET DeliveryInfo
payment.get("/delivery", getDeliveryInfo);

//PUT DeliveryInfo
payment.put("/deliveryUpdate", updateDelivery);
