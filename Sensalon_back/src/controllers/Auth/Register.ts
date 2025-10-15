import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { Users } from "../../bd/models/Users.model";
import { User } from "../../interfaces/User";
import conn from "../../bd/config/config";

export const Register = async (req: Request, res: Response) => {
    const { firstName, lastName, username, email, password } = req.body
    const salt_round = 12
    console.log('Registration attempted with:', { firstName, lastName, username, email, password })

    try {
        const passwordEncrypt = await bcrypt.hash(password, salt_round)
        const user = {
            p_vcRole: 'Usuario',
            p_vcfirstname: firstName,
            p_vclastname: lastName,
            p_vcusername: username,
            p_vcpassword: passwordEncrypt,
            p_vcemail: email,
            p_vcsalonData: null,
            p_vcdistributorData: null
        }

        await conn.query('CALL UserInsert(:p_vcRole, :p_vcfirstname, :p_vclastname, :p_vcusername, :p_vcpassword, :p_vcemail, :p_vcdistributorData, :p_vcsalonData)', {
            replacements: user
        }).then((result) => {
            if (result) {
                return res.status(200).json({ value: 0, message: 'Usuario creado correctamente' });
            }
            else {
                return res.status(404).json({ value: 1, message: 'Error al crear usuario el usuario, verifique el nombre de usuario o correo ' });
            }
        });
    } catch (error) {
        return res.status(500).json({ value: 1, message: 'Error del servidor' });
    }
}