import { Request, Response } from "express";
import { Credit } from "../../bd/models/Credits.model";
import { CreditPays } from "../../bd/models/CreditPay.model";


export const getCreditById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const credit = await Credit.findOne({ where: { iFIdUser: id } })
        if (!credit) {
            return res.status(404).json({ message: 'No se encontro el credito' });
        }
        return res.status(200).json(credit);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

export const getCreditPayById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const payCredit = await CreditPays.findAll({ where: { iFIdCredit: id } })
        if (!payCredit) {
            return res.status(404).json({ message: 'No se encontraron pagos' });
        }
        return res.status(200).json(payCredit);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
}