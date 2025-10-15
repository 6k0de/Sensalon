import { Request, Response } from "express";
import { SupplierModel } from "../../bd/models/Suppliers.model";


export const createSupplier = async (req: Request, res: Response) => {
    const { vcsupplier, vcrfc, vcrazonsocial, vcphone, vcemail } = req.body;

    try {
        const supplier = await SupplierModel.create({
            vcsupplier,
            vcrfc,
            vcrazonsocial,
            vcphone,
            vcemail,
        })
        res.status(201).json({
            message: 'Proveedor creado exitosamente',
            supplier,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el proveedor',
            error,
        })
    }
}

export const getAllSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await SupplierModel.findAll();
        res.status(200).json({
            message: 'Proveedores obtenidos exitosamente',
            suppliers,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los proveedores',
            error,
        })
    }
}

export const editSupplier = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { vcsupplier, vcrfc, vcrazonsocial, vcphone, vcemail } = req.body;
    try {
        const supplier = await SupplierModel.update({
            vcsupplier,
            vcrfc,
            vcrazonsocial,
            vcphone,
            vcemail,
        }, {
            where: {
                iIdSuppliers: id,
            }
        })
        res.status(200).json({
            message: 'Proveedor actualizado exitosamente',
            supplier,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el proveedor',
            error,
        })
    }
}

export const deleteSupplier = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const supplier = await SupplierModel.destroy({
            where: {
                iIdSuppliers: id,
            }
        })
        res.status(200).json({
            message: 'Proveedor eliminado exitosamente',
            supplier: 1,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el proveedor',
            supplier: 0,
            error,
        })
    }
}