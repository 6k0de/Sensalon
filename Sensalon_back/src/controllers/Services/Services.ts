import { Request, Response } from "express";
import { Services } from "../../bd/models/Services.model";

export const getAllServices = async(_:Request, res: Response) => {
    const services = await Services.findAll()
    if(services){
        res.json(services)
    }else{
        res.json({valor: 1, message: 'Error al obtener los Servicios'})
    }
}