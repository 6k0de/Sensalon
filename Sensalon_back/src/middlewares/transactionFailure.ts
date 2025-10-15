import path from "path";
import fs from "fs/promises";
import { FailedTransaction } from "../interfaces/FailedTransaction";

export const saveFailedTransaction = async (data: FailedTransaction): Promise<void> => {
    // Carpeta estable basada en la raíz del proyecto (funciona en dev y build)
    const folderPath = path.resolve(process.cwd(), "src/assets/transaccionesfallidas");

    // Asegura carpeta
    await fs.mkdir(folderPath, { recursive: true });

    // Nombre de archivo estable y legible
    const safeOrder = data.ordernum?.toString().replace(/[^\w-]/g, "") || Date.now().toString();
    const fileName = `${safeOrder}.json`;
    const filePath = path.join(folderPath, fileName);

    // Escribe JSON “bonito”
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`💾 Transacción fallida guardada en: ${filePath}`);
};