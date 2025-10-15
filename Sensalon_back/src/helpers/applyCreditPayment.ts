import conn from "../bd/config/config";
import { CreditPays } from "../bd/models/CreditPay.model";
import { Credit } from "../bd/models/Credits.model";
import { transporter } from "../controllers/nodemailer/config";

export const applyCreditPayment = async (transaction: any, user: any) => {
    const credit = await Credit.findOne({ where: { iFIdUser: transaction.iuserId } });
    if (!credit) return;

    await CreditPays.create({
        iFIdCredit: credit?.dataValues?.iIdCredits!,
        paymount: transaction.amount!,
        datepay: new Date(),
        paymentmethod: "Transferencia",
        referencpay: transaction.iIdTransaction!,
    });

    await Credit.update(
        { payamount: conn.literal(`payamount + ${transaction.amount}`) },
        { where: { iIdCredits: credit?.dataValues?.iIdCredits } }
    );

    await transporter.sendMail({
        from: "pedidos@sensalon.com.mx",
        to: user.vcemail,
        subject: `✅ Confirmación de Pago de Crédito #${credit.dataValues.iIdCredits}`,
        html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;  padding: 30px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #00b894; color: white; text-align: center; padding: 20px 10px;">
        <h1 style="margin: 0; font-size: 22px;">Pago Confirmado</h1>
      </div>

      <div style="padding: 25px; color: #333;">
        <p style="font-size: 16px;">Hola <strong>${user.vcfirstname} ${user.vclastname}</strong>,</p>

        <p style="font-size: 15px; line-height: 1.6;">
          Nos complace informarte que tu pago de crédito ha sido <strong>recibido y aprobado correctamente</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Monto Pagado</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(transaction.amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>ID de Crédito</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${credit.dataValues.iIdCredits}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Método de Pago</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Transferencia Bancaria</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Fecha</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</td>
          </tr>
        </table>

        <p style="margin-top: 25px; font-size: 15px; line-height: 1.6;">
          Si tienes alguna duda o deseas consultar tu historial de pagos, puedes ingresar a tu cuenta en <a href="https://sensalon.com.mx" style="color: #00b894; text-decoration: none; font-weight: 600;">Sensalon.com.mx</a>
        </p>

        <p style="margin-top: 15px; font-size: 14px; color: #555;">
          Gracias por tu confianza ❤️<br>
          <strong>El equipo de Sensalón</strong>
        </p>
      </div>

      <div style="background-color: #f0f0f0; text-align: center; padding: 15px;">
        <p style="margin: 0; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} Sensalón — Todos los derechos reservados.<br>
          <a href="https://sensalon.com.mx" style="color: #00b894; text-decoration: none;">www.sensalon.com.mx</a>
        </p>
      </div>
    </div>
  </div>
  `,
    });

};
