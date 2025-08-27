import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Users } from "../../bd/models/Users.model";
import conn from "../../bd/config/config";

export const Login = async (req: Request, res: Response) => {
    try {
        const user = await Users.findOne({ where: { vcusername: req.body.username } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.get('vcpassword') as string);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const id = user.get('iIdUser');

        const result = await conn.query('CALL GetRolUserLogin(:p_idUser)', { replacements: { p_idUser: id } });

        res.status(200).json({ idUser: id, products: result });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const LoginAdmin = async (req:Request, res: Response) => {
    const {username, password} = req.body

    try {
        const user = await Users.findOne({ where: { vcusername: username } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.get('vcpassword') as string);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const id = user.get('iIdUser');
        console.log(id)

        const result = await conn.query('CALL GetAdministradorLogin(:p_idUser)', { replacements: { p_idUser: id } });

        res.status(200).json({ idUser: id, message: 'Iniciando sesión correctamente', admin: result });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}
