import { Request, Response } from "express";
import conn from "../../bd/config/config";
import { QueryTypes } from "sequelize";

export const getDeliveryInfo = async (req: Request, res: Response) => {
  try {
    const delivery = await conn.query("SELECT * FROM secobraenvio");
    if (!delivery) {
      res
        .status(404)
        .json({ message: "No se obtuvo ninguna configuracion de envio" });
    }

    return res.status(200).json({ data: delivery[0] });
  } catch (error) {
    return res.status(500).json({ data: error });
  }
};

export const updateDelivery = async (req: Request, res: Response) => {
  const { seEnvia } = req.body;
  try {
    const updateDel = await conn.query(
      `UPDATE secobraenvio SET secobraenvio = ? WHERE iIdSecobraenvio = ?`,
      {
        replacements: [seEnvia, "6653168c-e381-11ef-8f1a-0050562645d0"],
        type: QueryTypes.UPDATE,
      },
    );

    return res.status(200).json({ data: 1 });
  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    return res.status(500).json({ data: 0, error: "Fallo del servidor" });
  }
};
