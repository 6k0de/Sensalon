import { Request, Response } from 'express'
import { ShippingAddresModel } from '../../bd/models/ShippingAdd.model'

export const CreateShippingAddress = async (req: Request, res: Response) => {
    const { country, name, lastname, address, suburb, interior, zipcode, city, state, phone, additonal } = req.body;
    const { id } = req.params;
    console.log({ id, country, name, lastname, address, suburb, interior, zipcode, city, state, phone, additonal });
    try {
        const insertShipping = await ShippingAddresModel.create({
            iIFIdUser: id,
            vccountry: country,
            vcfirstname: name,
            vclastname: lastname,
            vcaddress: address,
            vcsuburb: suburb,
            vcinterior: interior,
            vczipcode: zipcode,
            vccity: city,
            vcstate: state,
            vcphone: phone,
            vcadditonalindication: additonal
        });
        if (insertShipping) {
            res.status(200).json({ data: 1, message: 'Direccion insertada correctamente' });
        }
        else {
            res.status(404).json({ data: 0, message: 'Error al insertar la direccion' });
        }
    }
    catch (error) {
        res.status(500).json({ data: error, message: 'fallo en el servidor' });
    }
};

export const GetShippingAddressById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const shipping = await ShippingAddresModel.findAll({ where: { iIFIdUser: id }, limit: 4 });
        if (shipping?.length > 0) {
            res.status(200).json(shipping);
        }
        else {
            res.status(404).json({ data: 0, message: 'No se encontraron Direcciones' });
        }
    }
    catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ data: 1, message: 'Error del servidor ', error });
    }
};

export const DeleteShipping = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleteShip = await ShippingAddresModel.destroy({ where: { iIdAddressId: id } });
        if (deleteShip) {
            res.status(200).json({ data: 1, message: 'Direccion eliminada correctamente' });
        }
        else {
            res.status(404).json({ data: 0, message: 'Fallo al eliminar la dirección' });
        }
    }
    catch (error) {
        res.status(500).json({ data: error, message: 'Fallo en el servidor' });
    }
};
