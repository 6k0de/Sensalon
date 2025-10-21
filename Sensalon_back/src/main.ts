import express from "express";
import cors from "cors";
import path from "path";
import { payment } from "./routes/payment";
import { mainRouter } from "./routes";
import { setupAssociations } from "./bd/associations";

const app = express();

setupAssociations()
// Middleware para analizar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CORS middleware
app.use(cors(
  {
    origin: [
      "https://sensalon.com.mx",
      "https://admin.sensalon.com.mx",
    ]
  }
));
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

app.use("/api", mainRouter)
app.use("/payments", payment);

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado correctamente en el puerto ${port}`);
});
