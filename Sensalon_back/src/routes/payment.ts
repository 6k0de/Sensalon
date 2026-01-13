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
import { registerDiscountCodeUsageFromPreOrder } from "../helpers/discountCodeAplication";
import { approveOrderById } from "../helpers/approveOrderDiscountProducts";
import { Op } from "sequelize";

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
const normalizeMpStatus = (value: unknown) => String(value || "").toLowerCase();
const isNonEmptyValue = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "" &&
  String(value) !== "undefined" &&
  String(value) !== "null";
const buildMpTransactionLookup = (
  orderId: unknown,
  paymentId: unknown,
  merchantOrderId: unknown
) => {
  const whereOr: any[] = [];
  const orderNumber = Number(orderId);
  if (Number.isFinite(orderNumber) && orderNumber > 0) {
    whereOr.push({ iOrderPendingId: orderNumber });
  }
  if (isNonEmptyValue(paymentId)) {
    whereOr.push({ mercadoPagoPaymentId: String(paymentId) });
  }
  if (isNonEmptyValue(merchantOrderId)) {
    whereOr.push({ merchantOrderId: String(merchantOrderId) });
  }
  return whereOr;
};
const shouldUpdateStatus = (currentStatus: string, incomingStatus: string) => {
  if (!incomingStatus) return false;
  if (currentStatus === incomingStatus) return false;
  if (currentStatus === "approved") return false;
  return true;
};
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
payment.post('/createOrderTransferPayCredit', upload.array("files", 5), createOrderTransferPayCredit);

//POST CreateOrderTransfer
payment.post('/createOrderTransfer', upload.array("files", 5), createOrderTransfer)

//POST UpdateStatusTransaction
payment.post('/updateStatusTransaction/:id', updateStatusTransaction)




//GET PaymentSuccesMercadoPagoRedireccion
payment.get('/success', async (req: Request, res: Response) => {
  const { payment_id, status, merchant_order_id, orderId } = req.query;
  try {
    const preOrder = await CreateOrderPending.findOne({ where: { iIdOrderPending: Number(orderId) } });
    if (!preOrder) throw new Error("Orden no encontrada");

    const statusRaw = String(status || "");
    const statusNormalized = normalizeMpStatus(status);
    const preOrderStatus = normalizeMpStatus(preOrder.getDataValue("status"));
    const lookup = buildMpTransactionLookup(orderId, payment_id, merchant_order_id);
    let transaction: any = null;
    let currentTxStatus = "";

    if (lookup.length) {
      transaction = await TransactionModel.findOne({
        where: { paymentMethod: "MercadoPago", [Op.or]: lookup },
        order: [["createdAt", "DESC"]],
      });
      if (transaction) {
        currentTxStatus = normalizeMpStatus(transaction.getDataValue("status"));
      }
    }

    const isNewTransaction = !transaction;
    if (!transaction) {
      transaction = await TransactionModel.create({
        mercadoPagoPaymentId: String(payment_id),
        status: statusRaw,
        amount: preOrder.dataValues.total,
        iuserId: preOrder.dataValues.iIdUser,
        ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
        merchantOrderId: String(merchant_order_id),
        paymentMethod: "MercadoPago",
        products: preOrder.dataValues.products,
        iOrderPendingId: Number(orderId),
      });
    } else {
      const updateFields: Record<string, string> = {};
      if (isNonEmptyValue(payment_id) && !transaction.getDataValue("mercadoPagoPaymentId")) {
        updateFields.mercadoPagoPaymentId = String(payment_id);
      }
      if (isNonEmptyValue(merchant_order_id) && !transaction.getDataValue("merchantOrderId")) {
        updateFields.merchantOrderId = String(merchant_order_id);
      }
      if (shouldUpdateStatus(currentTxStatus, statusNormalized)) {
        updateFields.status = statusRaw;
      }
      if (Object.keys(updateFields).length > 0) {
        transaction = await transaction.update(updateFields);
      }
    }

    // 👇 Crédito: acumula deuda (lo usado se suma al total pendiente)
    if (statusNormalized === "approved" && preOrderStatus !== "completed" && preOrder.getDataValue('credit') > 0) {
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


    if (statusNormalized === "approved" && preOrderStatus !== "completed" && preOrder.getDataValue('cashback') > 0) {
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

    if (isNewTransaction) {
      await registerDiscountCodeUsageFromPreOrder(preOrder, statusRaw);
    }

    if (statusNormalized === "approved" && preOrderStatus !== "completed") {
      const approval = await approveOrderById(String(orderId));
      if (!approval.ok && approval.message !== 'No hay reservas activas para esta orden') {
        throw new Error(approval.message || "No se pudo descontar stock.");
      }
    }


    const idTransaction = transaction.dataValues.iIdTransaction;
    if (statusNormalized === "approved" && preOrderStatus !== "completed") {
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

    const statusRaw = String(status || "");
    const statusNormalized = normalizeMpStatus(status);
    const preOrderStatus = normalizeMpStatus(preOrder.getDataValue("status"));
    const lookup = buildMpTransactionLookup(orderId, payment_id, merchant_order_id);
    let transaction: any = null;
    let currentTxStatus = "";

    if (lookup.length) {
      transaction = await TransactionModel.findOne({
        where: { paymentMethod: "MercadoPago", [Op.or]: lookup },
        order: [["createdAt", "DESC"]],
      });
      if (transaction) {
        currentTxStatus = normalizeMpStatus(transaction.getDataValue("status"));
      }
    }

    if (!transaction) {
      transaction = await TransactionModel.create({
        mercadoPagoPaymentId: String(payment_id),
        status: statusRaw,
        amount: preOrder.dataValues.total,
        iuserId: preOrder.dataValues.iIdUser,
        ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
        merchantOrderId: String(merchant_order_id),
        paymentMethod: "MercadoPago",
        products: preOrder.dataValues.products,
        iOrderPendingId: Number(orderId),
      });
    } else {
      const updateFields: Record<string, string> = {};
      if (isNonEmptyValue(payment_id) && !transaction.getDataValue("mercadoPagoPaymentId")) {
        updateFields.mercadoPagoPaymentId = String(payment_id);
      }
      if (isNonEmptyValue(merchant_order_id) && !transaction.getDataValue("merchantOrderId")) {
        updateFields.merchantOrderId = String(merchant_order_id);
      }
      if (shouldUpdateStatus(currentTxStatus, statusNormalized)) {
        updateFields.status = statusRaw;
      }
      if (Object.keys(updateFields).length > 0) {
        transaction = await transaction.update(updateFields);
      }
    }

    const idTransaction = transaction.dataValues.iIdTransaction;

    if (preOrderStatus !== "completed") {
      await preOrder.update({ status: "failed" });
    }

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

    const statusRaw = String(status || "");
    const statusNormalized = normalizeMpStatus(status);
    const preOrderStatus = normalizeMpStatus(preOrder.getDataValue("status"));
    const lookup = buildMpTransactionLookup(orderId, payment_id, merchant_order_id);
    let transaction: any = null;
    let currentTxStatus = "";

    if (lookup.length) {
      transaction = await TransactionModel.findOne({
        where: { paymentMethod: "MercadoPago", [Op.or]: lookup },
        order: [["createdAt", "DESC"]],
      });
      if (transaction) {
        currentTxStatus = normalizeMpStatus(transaction.getDataValue("status"));
      }
    }

    const isNewTransaction = !transaction;
    if (!transaction) {
      transaction = await TransactionModel.create({
        mercadoPagoPaymentId: String(payment_id),
        status: statusRaw,
        amount: preOrder.dataValues.total,
        iuserId: preOrder.dataValues.iIdUser,
        ishippingAddressId: preOrder.dataValues.iIdShippingAddress,
        merchantOrderId: String(merchant_order_id),
        paymentMethod: "MercadoPago",
        products: preOrder.dataValues.products,
        iOrderPendingId: Number(orderId),
      });
    } else {
      const updateFields: Record<string, string> = {};
      if (isNonEmptyValue(payment_id) && !transaction.getDataValue("mercadoPagoPaymentId")) {
        updateFields.mercadoPagoPaymentId = String(payment_id);
      }
      if (isNonEmptyValue(merchant_order_id) && !transaction.getDataValue("merchantOrderId")) {
        updateFields.merchantOrderId = String(merchant_order_id);
      }
      if (shouldUpdateStatus(currentTxStatus, statusNormalized)) {
        updateFields.status = statusRaw;
      }
      if (Object.keys(updateFields).length > 0) {
        transaction = await transaction.update(updateFields);
      }
    }

    const idTransaction = transaction.dataValues.iIdTransaction;
    if (isNewTransaction) {
      await registerDiscountCodeUsageFromPreOrder(preOrder, statusRaw);
    }

    if (preOrderStatus !== "completed") {
      await preOrder.update({ status: "pending" });
    }

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
