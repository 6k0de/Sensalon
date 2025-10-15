import { Request, Response } from "express";
import conn from "../../bd/config/config";

export const getCashbackByUserId = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const [result] = await conn.query(
            "CALL GetUserCashbackBalance(:p_user_id)",
            {
                replacements: { p_user_id: id },
            }
        );

        return res.status(200).json({ value: 0, data: result });
    } catch (error) {
        console.error("Error al obtener cashback:", error);
        return res.status(500).json({
            value: 1,
            message: "Error al obtener el cashback",
            error,
        });
    }
}