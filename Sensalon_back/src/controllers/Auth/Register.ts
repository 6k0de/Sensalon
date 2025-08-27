import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { Users } from "../../bd/models/Users.model";
import { User } from "../../interfaces/User";

export const Register = async (req: Request, res: Response) => {
    const  {firstName, lastName, username, email, password } = req.body
    const salt_round = 12
    console.log('Registration attempted with:', { firstName, lastName, username, email, password })

    try {
        const passwordEncrypt = await bcrypt.hash(password, salt_round)
        const user: User = {
            iFIdRole: '8337416f-7177-11ef-a9b1-0050563b',
            vcfirstname: firstName,
            vclastname: lastName,
            vcusername: username,
            vcemail: email,
            vcpassword: passwordEncrypt
        }

        const usuarioReg = await Users.create(user)
        if (usuarioReg) {
            return res.status(200).json({ value: 0, message: 'Usuario insertado correctamente' });
        } else {
            return res.status(500).json({ value: 1, message: 'Error al insertar usuario' });
        }
    } catch (error) {
        return res.status(500).json({ value: 1, message: 'Error al crear el usuario, verifique el nombre de usuario o correo' });

    }
}