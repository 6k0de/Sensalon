import { Request, Response } from "express";
import { Companies } from "../../bd/models/Companies.model";

export const insertCompanies = async (req: Request, res: Response) => {
    const { vcname, vcdescription, vcsocialreason, vcorigin, vcmanufacturingaddress, vcemail, vcphone, vcwebsite } = req.body
    console.log(req.body)
    const newComp = await Companies.create({ vcname: vcname, vcdescription: vcdescription, vcsocialreason: vcsocialreason, vcorigin: vcorigin, vcmanufacturingaddress: vcmanufacturingaddress, vcemail: vcemail, vcphone: vcphone, vcwebsite: vcwebsite })
    if (newComp != null) {
        res.json({ value: 0, message: 'Compañia insertada correctamente' })
    } else {
        res.json({ value: 1, message: 'Error al insertar compañia' })
    }
}

export const getAllCompanies = async (_: Request, res: Response) => {
    const empresas = await Companies.findAll()
    res.json(empresas)
}

export const updateCompanies = async (req: Request, res: Response) => {
    const { iIdCompany, vcname, vcdescription, vcsocialreason, vcorigin, vcmanufacturingaddress, vcemail, vcphone, vcwebsite } = req.body
    console.log(req.body)
    try {
        const updComp = await Companies.update({ vcname: vcname, vcdescription: vcdescription, vcsocialreason: vcsocialreason, vcorigin: vcorigin, vcmanufacturingaddress: vcmanufacturingaddress, vcemail: vcemail, vcphone: vcphone, vcwebsite: vcwebsite }, { where: { iIdCompany: iIdCompany } })
        if (updComp != null) {
            res.json({ value: 0, message: 'Compañia actualizada correctamente' })
        } else {
            res.json({ value: 1, message: 'Error al actualizar compañia' })
        }
    } catch (error) {
        console.error('Error actualizando la empresa:', error);
        res.status(500).json({ valor: 1, message: 'Error al intentar actualizar la empresa', error });
    }

}

export const deleteCompanies = async (req: Request, res: Response) => {
    const id = req.params.id
    console.log(id)
    try {
        const companieEliminada = await Companies.destroy({ where: { iIdCompany: id } })
        if (companieEliminada) {
            console.log(`Empresa con ID ${id} eliminado`);
            res.status(200).json({ valor: 0, message: 'Empresa eliminada correctamente' });
        } else {
            res.status(403).json({ message: 'Empresa no encontrado o eliminada incorrectamente' });
        }
    } catch (error) {
        console.error('Error eliminando la empresa:', error);
        res.status(500).json({ valor: 1, message: 'Error al intentar eliminar la empresa', error });
    }
}