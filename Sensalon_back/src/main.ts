import express from "express";
import cors from "cors";
import path from "path";
import { router } from "./routes/routes"; // Ruta de las rutas que ya tienes
import { payment } from "./routes/payment";
import { AssociationsUserTransactions } from "./bd/associations/AssocionsUserTransactions";
import { AssociationsShippingTransactions } from "./bd/associations/AssociatiosShippingTransactions";

const app = express();

AssociationsUserTransactions()
AssociationsShippingTransactions()

// Middleware para analizar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CORS middleware
app.use(cors());
app.use("/imagenes", express.static(path.join(__dirname, "assets/imagenes")));
app.use("/archivos", express.static(path.join(__dirname, "assets/archivos")));
app.use(
  "/assets/slider",
  express.static(path.join(__dirname, "assets/slider")),
);
app.use(
  "/assets/comprobantetransf",
  express.static(path.join(__dirname, "assets/comprobantetransf")),
);
app.use("/api", router);
app.use("/payments", payment);
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado correctamente en el puerto ${port}`);
});
