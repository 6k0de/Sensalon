import { Request, Response } from "express"
import { Categories } from "../../bd/models/Categories.model"


export const insertCategorie = async (req: Request, res: Response) => {
    const { vcname, vcdescription } = req.body;
    console.log("Datos recibidos:", req.body);
    const newCat = await Categories.create({ vcname: vcname, vcdescription: vcdescription })
    if (newCat != null) {
        res.json({ value: 0, message: 'Categoria insertada correctamente' })
    } else {
        res.json({ value: 1, message: 'Error al insertar categoria' })
    }
}
export const getAllCategories = async (_: Request, res: Response) => {
    const categories = await Categories.findAll()
    res.json(categories)
}

export const updateCategoria = async (req: Request, res: Response) => {
    const { vcname, vcdescription, iIdCategory } = req.body
    console.log("Datos recibidos:", req.body);

    const updCat = await Categories.update({ vcname: vcname, vcdescription: vcdescription }, { where: { iIdCategory: iIdCategory } })
    if (updCat != null) {
        res.json({ value: 0, message: 'Categoria actualizada correctamente' })
    } else {
        res.json({ value: 1, message: 'Error al actualizar categoria' })
    }
}

export const deleteCategorie = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const categoriaEliminada = await Categories.destroy({ where: { iIdCategory: id } })
        if (categoriaEliminada) {
            console.log(`Categoria con ID ${id} eliminado`);
            res.status(200).json({ valor: 0, message: 'Categoria eliminada correctamente' });
        } else {
            res.status(403).json({ message: 'Categoria no encontrado o eliminada incorrectamente' });
        }
    } catch (error) {
        console.error('Error eliminando la categoria:', error);
        res.status(500).json({ valor: 1, message: 'Error al intentar eliminar la categoria', error });
    }
}