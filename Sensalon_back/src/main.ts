import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes/routes';  // Ruta de las rutas que ya tienes

const app = express();

// Middleware para analizar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CORS middleware
app.use(cors());
app.use('/imagenes', express.static(path.join(__dirname, 'assets/imagenes')));
app.use('/archivos', express.static(path.join(__dirname, 'assets/archivos')))
app.use('/api', router);  
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado correctamente en el puerto ${port}`);
});
