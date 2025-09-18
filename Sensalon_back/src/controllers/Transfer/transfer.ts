import { Request, Response } from "express";
import { TransferModel } from "../../bd/models/Transfer.model";

export const getInfoTransfer = async (_: Request, res: Response) => {
  try {
    const info = await TransferModel.findOne();
    if (!info) {
      res
        .status(404)
        .json({ message: "No se encontraron los datos de transferencia" });
    }

    return res.status(200).json(info);
  } catch (error) {
    console.error(error);
    return res.send(500).json({ message: "Error en el servidor" });
  }
};

export const infoTransferUpdate = async (req: Request, res: Response) => {
  const {
    iIdInfotransfer,
    bankname,
    accountname,
    accountnumber,
    interbankcode,
    cardnumber,
  } = req.body;

  try {
    const result = await TransferModel.update(
      { bankname, accountname, accountnumber, interbankcode, cardnumber },
      { where: { iIdInfotransfer: iIdInfotransfer } },
    );
    if (!result) {
      res.status(404).json({ message: "Error al actualizar la informacion" });
    }

    return res
      .status(200)
      .json({ message: "Información actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
