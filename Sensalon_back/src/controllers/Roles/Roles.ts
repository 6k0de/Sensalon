import { Request, Response } from "express";
import { Roles } from "../../bd/models/Roles.model";

export const getAllRoles = async(_:Request, res: Response) => {
    const roles = await Roles.findAll()
    if(roles){
        res.json(roles)
    }else{
        res.json({valor: 1, message: 'Error al obtener los roles'})
    }
}