import { Request, Response } from "express";
import { Users } from "../../bd/models/Users.model";
import { PasswordResetModel } from "../../bd/models/PasswordReset.model";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { transporter } from "../nodemailer/config";

dotenv.config()

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        const user = await Users.findOne({ where: { vcemail: email } })
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString()

        await PasswordResetModel.create({
            vcemail: email,
            vctoken: token,
            dtexpiration: new Date(Date.now() + 15 * 60 * 1000),
        })

        await transporter.sendMail({
            from: `"Soporte Sensalon" <${process.env.USER_EMAIL}>`, // remitente
            to: email,
            subject: "Recuperación de contraseña",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <h1 style="color: #2d89ef; text-align: center; letter-spacing: 4px;">${token}</h1>
          <p>Este código expira en <b>15 minutos</b>.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <br />
          <p style="font-size: 12px; color: gray;">© 2025 Sensalon</p>
        </div>
      `,
        })

        return res.json({ message: "Token enviado al correo" });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        return res.status(500).json({ error: "Error al enviar el correo" });
    }
}

export const verifyToken = async (req: Request, res: Response) => {
    const { email, token } = req.body

    const record = await PasswordResetModel.findOne({
        where: { vcemail: email, vctoken: token }
    })

    if (!record) {
        return res.status(400).json({ error: "Token inválido" });
    }

    if (new Date() > record.dataValues.dtexpiration) {
        return res.status(400).json({ error: "Token expirado" });
    }

    return res.json({ message: "Token válido" });
}

export const resetPassword = async (req: Request, res: Response) => {
    const { email, token, newPassword } = req.body

    const record = await PasswordResetModel.findOne({
        where: { vcemail: email, vctoken: token }
    })
    console.log(record)

    if (!record) {
        return res.status(400).json({ error: "Token inválido" });
    }
    if (new Date() > record.dataValues.dtexpiration) {
        return res.status(400).json({ error: "Token expirado" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('hashedPassword', hashedPassword)
    const [updated] = await Users.update(
        { vcpassword: hashedPassword },
        { where: { vcemail: email } }
    );
    console.log("Filas actualizadas:", updated);

    const updatedUser = await Users.findOne({ where: { vcemail: email } });
    console.log("Nuevo password en DB:", updatedUser?.dataValues.vcpassword);

    await record.destroy();

    return res.json({ message: "Contraseña actualizada correctamente" });
}