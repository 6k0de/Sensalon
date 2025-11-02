import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import {
  getInfoTransfer,
  infoTransferUpdate,
} from "../controllers/Transfer/transfer";
import {
  getDeliveryInfo,
  updateDelivery,
} from "../controllers/Delivery/delivery";
import { CreateOrderPending } from "../bd/models/OrderPending.model";
import { TransactionModel } from "../bd/models/Transaction.model";
import { buildTransactionHtml } from "../helpers/buildTransactionHtml";
import { transporter } from "../controllers/nodemailer/config";
import { createOrderMercadoPago, createOrderTransfer, createOrderTransferPayCredit } from "../controllers/Payments/payments";
import { ShippingAddresModel } from "../bd/models/ShippingAdd.model";
import { updateStatusTransaction } from "../controllers/Transactions/transactions";
import { Credit } from "../bd/models/Credits.model";
import { CashBack } from "../bd/models/Cashback.model";
import { Users } from "../bd/models/Users.model";

dotenv.config();
export const payment = Router();

payment.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
  );
  next();
});

const BASE_URL_FRONT_PROD = 'https://sensalon.com.mx/payments'
//const BASE_URL_FRONT_PREPROD = 'https://test.sensalon.com.mx/payments'
//const BASE_URL_FRONT_DEV = 'http://localhost:5173/payments'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets/comprobantetransf")); // Carpeta donde se guardarÃ¡n los archivos
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });

//GET InfoBankAccount
payment.get("/infoTransfer", getInfoTransfer);
//PUT InfoBankAccount
payment.put("/infoTransferUpdate", infoTransferUpdate);

//GET DeliveryInfo
payment.get("/delivery", getDeliveryInfo);
//PUT DeliveryInfo
payment.put("/deliveryUpdate", updateDelivery);

//POST CreateOrderPayMercadoPago
payment.post('/createOrder', createOrderMercadoPago)

//POST CreateOrderPayCredit
payment.post('/createOrderTransferPayCredit', upload.single("file"), createOrderTransferPayCredit);

//POST CreateOrderTransfer
payment.post('/createOrderTransfer', upload.single("file"), createOrderTransfer)

//POST UpdateStatusTransaction
payment.post('/updateStatusTransaction/:id', updateStatusTransaction)




//GET PaymentSuccesMercadoPagoRedireccion
payment.get('/success', async (req: Request, res: Response) => {
  const { payment_id, status, merchant_order_id, orderId } = req.query;
  try {
    const preOrder = await CreateOrderPending.findOne({ where: { iIdOrderPending: Number(orderId) } });
    if (!preOrder) throw new Error("Orden no encontrada");

    const transaction = await TransactionModel.create({
      mercadoPagoPaymentId: String(payment_id),
      status: String(status || ""),
      amount: preOrder.dataValues.total,
      iuserId: preOrder.dataValues.iIdUser,
      ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
      merchantOrderId: String(merchant_order_id),
      paymentMethod: 'MercadoPago',
      products: preOrder.dataValues.products,
      iOrderPendingId: Number(orderId),
    })

    // 👇 Crédito: acumula deuda (lo usado se suma al total pendiente)
    if (preOrder.getDataValue('credit') > 0) {
      const usedCredit = Number(preOrder.getDataValue('credit')) || 0;

      const userCredit = await Credit.findOne({
        where: { iFIdUser: preOrder.dataValues.iIdUser },
      });

      if (userCredit) {
        // suma lo usado al total por pagar
        const current = Number(userCredit.getDataValue('totalpayamount')) || 0;
        const newTotal = current + usedCredit;

        await Credit.update(
          { totalpayamount: newTotal, state: 1 }, // state=1 => con deuda activa
          { where: { iIdCredits: userCredit.dataValues.iIdCredits } }
        );
      }
    }


    if (preOrder.getDataValue('cashback') > 0) {
      const usedCashback = preOrder.getDataValue('cashback');
      const cash = await CashBack.findOne({ where: { FiIdUser: preOrder.dataValues.iIdUser } });

      if (cash) {
        const currentAmount = cash.getDataValue('cashbackamount') || 0;
        const newAmount = Math.max(0, currentAmount - usedCashback); // evitar valores negativos
        await CashBack.update(
          { cashbackamount: newAmount },
          { where: { iIdCashback: cash.dataValues.iIdCashback } }
        );
        await Users.update({
          cashbackbalance: newAmount
        },
          { where: { iIdUser: preOrder.dataValues.iIdUser } }
        )
      }
    }

    const idTransaction = transaction.dataValues.iIdTransaction;
    const direccion = await ShippingAddresModel.findOne({ where: { iIdAddressId: preOrder.dataValues.iIdShippingAddress } });

    await preOrder.update({ status: "completed" });

    try {
      const htmlContent = await buildTransactionHtml(transaction, preOrder, direccion?.dataValues);

      const info = await transporter.sendMail({
        from: 'pedidos@sensalon.com.mx',
        to: 'pedidos@sensalon.com.mx', //borrelizzy@gmail.com
        subject: `Nueva Orden de Compra - ${idTransaction}`,
        html: htmlContent
      });

      console.log('Correo enviado:', info.response);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }

    const redirectUrl = `${BASE_URL_FRONT_PROD}/success?` +
      `orderNumber=${idTransaction}` +
      `&amount=${preOrder.dataValues.total}` +
      `&method=${transaction.dataValues.paymentMethod}` +
      `&date=${encodeURIComponent(new Date().toISOString())}`;
    // Redirigir a frontend
    res.redirect(302, redirectUrl);

  } catch (error: any) {
    console.error("Error en success:", error);
    const redirectUrl = `${BASE_URL_FRONT_PROD}/ordenFallida?` +
      `orderId=${orderId}` +
      `&paymentId=${payment_id || ""}` +
      `&status=${status || "rejected"}` +
      `&method=MercadoPago` +
      `&date=${encodeURIComponent(new Date().toISOString())}` +
      `&message=${encodeURIComponent(error.message || "Error en el pago")}`;
    res.redirect(302, redirectUrl);
  }
})

payment.get('/failure', async (req: Request, res: Response) => {
  const { payment_id, status, merchant_order_id, orderId } = req.query;
  try {
    const preOrder = await CreateOrderPending.findOne({ where: { iIdOrderPending: Number(orderId) } });
    if (!preOrder) throw new Error("Orden no encontrada");

    const transaction = await TransactionModel.create({
      mercadoPagoPaymentId: String(payment_id),
      status: String(status || ""),
      amount: preOrder.dataValues.total,
      iuserId: preOrder.dataValues.iIdUser,
      ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
      merchantOrderId: String(merchant_order_id),
      paymentMethod: 'MercadoPago',
      products: preOrder.dataValues.products,
      iOrderPendingId: Number(orderId),
    })

    const idTransaction = transaction.dataValues.iIdTransaction;

    await preOrder.update({ status: "failed" });

    const redirectUrl = `${BASE_URL_FRONT_PROD}/failure?` +
      `orderId=${orderId}` +
      `&idTransaction=${idTransaction}` +
      `&paymentId=${payment_id || ""}` +
      `&status=${status || "rejected"}` +
      `&method=${transaction.dataValues.paymentMethod}` +
      `&date=${encodeURIComponent(new Date().toISOString())}`;
    res.redirect(302, redirectUrl);

  } catch (error: any) {
    console.error("Error en success:", error);
    const redirectUrl = `${BASE_URL_FRONT_PROD}/ordenFallida?` +
      `orderId=${orderId}` +
      `&paymentId=${payment_id || ""}` +
      `&status=${status || "rejected"}` +
      `&method=MercadoPago` +
      `&date=${encodeURIComponent(new Date().toISOString())}` +
      `&message=${encodeURIComponent(error.message || "Error en el pago")}`;
    res.redirect(302, redirectUrl);
  }
})

payment.get('/pending', async (req: Request, res: Response) => {
  const { payment_id, status, merchant_order_id, orderId } = req.query;
  try {
    const preOrder = await CreateOrderPending.findOne({ where: { iIdOrderPending: Number(orderId) } });
    if (!preOrder) throw new Error("Orden no encontrada");

    const transaction = await TransactionModel.create({
      mercadoPagoPaymentId: String(payment_id),
      status: String(status || ""),
      amount: preOrder.dataValues.total,
      iuserId: preOrder.dataValues.iIdUser,
      ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
      merchantOrderId: String(merchant_order_id),
      paymentMethod: 'MercadoPago',
      products: preOrder.dataValues.products,
      iOrderPendingId: Number(orderId),
    })

    const idTransaction = transaction.dataValues.iIdTransaction;

    await preOrder.update({ status: "pending" });

    const redirectUrl = `${BASE_URL_FRONT_PROD}/pending?` +
      `orderId=${orderId}` +
      `&idTransaction=${idTransaction}` +
      `&paymentId=${payment_id || ""}` +
      `&status=${status || "pending"}` +
      `&method=${transaction.dataValues.paymentMethod}` +
      `&date=${encodeURIComponent(new Date().toISOString())}`;
    res.redirect(302, redirectUrl);

  } catch (error: any) {
    console.error("Error en success:", error);
    const redirectUrl = `${BASE_URL_FRONT_PROD}/ordenFallida?` +
      `orderId=${orderId}` +
      `&paymentId=${payment_id || ""}` +
      `&status=${status || "pending"}` +
      `&method=MercadoPago` +
      `&date=${encodeURIComponent(new Date().toISOString())}` +
      `&message=${encodeURIComponent(error.message || "Error en el pago")}`;
    res.redirect(302, redirectUrl);
  }
})

