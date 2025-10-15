import { createTransport } from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    logger: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL
    },
    tls: {
        rejectUnauthorized: false
    }
});
