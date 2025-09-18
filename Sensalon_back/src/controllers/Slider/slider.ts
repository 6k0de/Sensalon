import { Request, Response } from "express";
import { SliderImageModel } from "../../bd/models/SliderImage.model";
import path from "path";
import fs from "fs";

export const uploadSlider = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron imagenes" });
    }

    const imageToInsert = files.map((file) => ({
      vcurl_img: `/assets/slider/${file.filename}`,
      vcorden: "null",
    }));

    const insertedImages = await SliderImageModel.bulkCreate(imageToInsert);

    return res.status(200).json({
      message: "Imagen insertada correctamente",
      data: insertedImages,
    });
  } catch (error) {
    console.error("error al subir las imagenes", error);
    return res.status(500).json({
      error: "Error al subir imagenes del slider",
    });
  }
};

export const getSliderImages = async (req: Request, res: Response) => {
  try {
    const images = await SliderImageModel.findAll({
      attributes: ["iIdSliderImage", "vcurl_img", "vcorden", "dtCreated"],
      order: [["vcorden", "ASC"]],
    });

    const fullImages = images.map((image) => ({
      ...image.toJSON(),
      vcurl_img: `${req.protocol}://${req.get("host")}${image.getDataValue("vcurl_img")}`,
    }));

    return res.status(200).json(fullImages);
  } catch (error) {
    console.error("Error al obtener imágenes del slider:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener imágenes del slider." });
  }
};

export const deleteSliderImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await SliderImageModel.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: "Imagen no encontrada." });
    }

    const imagePath = path.join(
      __dirname,
      `../../assets${image.getDataValue("vcurl_img")}`,
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await SliderImageModel.destroy({ where: { iIdSliderImage: id } });

    return res.status(200).json({ message: "Imagen eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return res.status(500).json({ error: "Error al eliminar imagen." });
  }
};
