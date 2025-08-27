import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import conn from "../../bd/config/config";

/* export const getAllUsers = async (_: Request, res: Response) => {
    const usuarios = await conn.query('CALL GetUserInfo()')
    res.json(usuarios)
}
 */
export const getAllDistributors = async(_:Request, res: Response) => {
    const distributorsData = await conn.query('CALL GetUserDistributorInfo()')
    if(distributorsData){
        res.status(200).json({value: 1, message: 'Distribuidores obtenidos con exito', distribuidores: distributorsData})
    }else{
        res.status(400).json({value: 1, message: 'Error al obtener los distribuidores', distribuidores: []})
    }
}


export const getAllSalons = async(_:Request, res: Response) => {
    const salonData = await conn.query('CALL GetUserSalonInfo()')
    if(salonData){
        res.status(200).json({value: 1, message: 'Salones obtenidos con exito', salones: salonData})
    }else{
        res.status(400).json({value: 1, message: 'Error al obtener los Salones', salones: []})
    }
}


export const getAllUsersN = async(_:Request, res: Response) => {
    const usersData = await conn.query('CALL GetUserPerfilInfo()')
    if(usersData){
        res.status(200).json({value: 1, message: 'Usuarios obtenidos con exito', usuarios: usersData})
    }else{
        res.status(400).json({value: 1, message: 'Error al obtener los Usuarios', usuarios: []})
    }
}

export const CreateUser = async (req: Request, res: Response) => {
    const salt = 12
    const { role, nombres, apellidos, username, password, email, salonData, distributorData } = req.body
    console.log({ role, nombres, apellidos, username, password, email, salonData, distributorData })

    let constanciaFiscalPath: string | null = null;
    let logoPath: string | null = null;

    if (req.files && !Array.isArray(req.files)) {
        if ('constanciaFiscal' in req.files) {
            constanciaFiscalPath = `/assets/archivos/${(req.files as { [fieldname: string]: Express.Multer.File[] })['constanciaFiscal'][0].filename}`;
        }
        if ('logoSalon' in req.files) {
            logoPath = `/assets/logos/${(req.files as { [fieldname: string]: Express.Multer.File[] })['logoSalon'][0].filename}`;
        }
    }

    try {
        const newPassword = await bcrypt.hash(password, salt)
        console.log({ constanciaFiscalPath, logoPath })

        const parameters = {
            p_vcRole: role,
            p_vcfirstname: nombres,
            p_vclastname: apellidos,
            p_vcusername: username,
            p_vcpassword: newPassword,
            p_vcemail: email,
            p_vcsalonData: salonData ? JSON.stringify({ ...salonData, logo: logoPath }) : null,
            p_vcdistributorData: distributorData ? JSON.stringify({ ...distributorData, constanciaFiscal: constanciaFiscalPath }) : null,
        }

        console.log('hola', parameters)

        const result = await conn.query(
            'CALL UserInsert(:p_vcRole, :p_vcfirstname, :p_vclastname, :p_vcusername, :p_vcpassword, :p_vcemail, :p_vcdistributorData, :p_vcsalonData)',
            { replacements: parameters }
        );
        console.log(result)

    } catch (err) {
        console.error(err)
    }
}