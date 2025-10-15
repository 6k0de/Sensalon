import { ShippingAddresModel } from "../bd/models/ShippingAdd.model";
import { transporter } from "../controllers/nodemailer/config";
import { buildTransactionHtml } from "./buildTransactionHtml";

export const handleEmails = async (transaction: any, user: any, isApproved?: boolean) => {
  const direccion = await ShippingAddresModel.findOne({ where: { iIdAddressId: transaction.ishippingAddressId! } });

  const preOrder = {
    subtotal: transaction.amount,
    shipping: 0,
    cashback: 0,
    credit: 0,
    total: transaction.amount,
  };

  const htmlContent = await buildTransactionHtml(transaction, preOrder, direccion?.dataValues, true);

  // Email a administradores
  await transporter.sendMail({
    from: "pedidos@sensalon.com.mx",
    to: "borrelizzy@gmail.com", // pedidos@sensalon.com.mx, pedidosaprobados@sensalon.com.mx
    subject: `Nueva Orden - ${transaction.iIdTransaction}`,
    html: htmlContent,
  });

  // Email al cliente
  await transporter.sendMail({
    from: "pedidos@sensalon.com.mx",
    to: user.vcemail,
    subject: `Confirmación Pedido - ${transaction.iIdTransaction}`,
    html: `
      <h1>Confirmación de Pedido</h1>
      <p>Estimado/a ${user.vcfirstname} ${user.vclastname}, su pago fue aprobado.</p>
      ${htmlContent}
    `,
  });
};
