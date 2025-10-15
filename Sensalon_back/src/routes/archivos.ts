import { Request, Response, Router } from "express";
import path from "path";
import fs from "fs";

export const archivosRouter = Router()

//GET Archivos
archivosRouter.get("/archivos/:filename", (req: Request, res: Response) => {
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