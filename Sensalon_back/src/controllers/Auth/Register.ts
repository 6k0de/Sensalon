import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { Users } from "../../bd/models/Users.model";
import { User } from "../../interfaces/User";
import conn from "../../bd/config/config";
import { UniqueConstraintError, ValidationError } from "sequelize";

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
    } catch (error: any) {
        console.log(error)
        console.error(error); // log completo solo en servidor

        // 🔹 Caso 1: email duplicado o violación única
        if (error instanceof UniqueConstraintError || error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors?.[0]?.path || "Campo";
            const message = field.includes("email") || field.includes("vcEmail")
                ? "El correo electrónico ya está registrado"
                : field.includes("username") || field.includes("vcUsername")
                ? "El nombre de usuario ya está en uso"
                : "Ya existe un registro con este usuario y correo electrónico";

            return res.status(400).json({ value: 1, message });
        }

        // 🔹 Caso 2: validaciones de modelo (si usas .create o .build)
        if (error instanceof ValidationError || error.name === "SequelizeValidationError") {
            const messages = error.errors.map((e: any) => e.message);
            return res.status(400).json({ value: 1, message: messages.join(", ") });
        }

        // 🔹 Caso 3: errores de MySQL comunes
        if (error.parent?.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                value: 1,
                message: "El valor ingresado ya existe en el sistema (duplicado)",
            });
        }

        // 🔹 Caso 4: error genérico (seguro)
        return res.status(500).json({
            value: 1,
            message: "Error interno del servidor. Intente nuevamente más tarde.",
        });
    }
}