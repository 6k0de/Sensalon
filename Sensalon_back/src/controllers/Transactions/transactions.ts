

/* const Transaction = __importDefault(require("../../bd/models/Transaction.model"));
const Users= __importDefault(require("../../bd/models/Users.model"));
const CashbackConf = require("../../bd/models/CashbackConf.model");
const Cashback = require("../../bd/models/Cashback.model");
const CreditPay = require("../../bd/models/CreditPay.model");
const Credits = require("../../bd/models/Credits.model");
const sequelize_1 = require("sequelize");
const ShippingAdd = require("../../bd/models/ShippingAdd.model");
const config_1 = require("../nodemailer/config");
const Companies = require("../../bd/models/Companies.model"); */

import { Request, Response } from "express";
import { TransactionModel } from "../../bd/models/Transaction.model";
import { Users } from "../../bd/models/Users.model";

export const GetAllTransactions = async (_: Request, res: Response) => {
    try {
        const transactions = await TransactionModel.findAll({
            include: [{
                    model: Users,
                    as: 'user', // Asegúrate de que el alias 'user' coincide con el definido en las asociaciones
                    attributes: ['vcusername'] // Especifica aquí los atributos que quieres obtener del usuario
                }]
        });
        if (transactions.length > 0) {
            res.status(200).json(transactions);
        }
        else {
            res.status(404).json({ value: 1, message: 'No se encontraron transacciones' });
        }   
    }
    catch (error) {
        console.error('error al obtener las transacciones');
        res.status(500).json({ value: 1, message: 'Error del servidor al obtener las transacciones', error });
    }
};
/* const updateStatusTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log({ id, status });
        let responseMessage = { status: 200, message: "Transacción actualizada correctamente" };
        let cashback = 0;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaccion no encontrada' });
        }
        const idCredit = await Credits.Credit.findOne({ where: { iFIdUser: transaction.iuserId } });
        const userid = transaction.iuserId;
        const user = await Users.findByPk(userid);
        if (transaction.paymentMethod === 'TBC' && status === 'approved') {
            const payCredit = await CreditPay.CreditPay.create({
                iFIdCredit: idCredit?.dataValues.iIdCredits,
                paymount: transaction.amount,
                datepay: new Date(),
                paymentmethod: "Transferencia",
                referencpay: transaction.iIdTransaction
            });
            if (payCredit) {
                await Credits.Credit.update({ payamount: sequelize_1.Sequelize.literal(`payamount + ${transaction.amount}`) }, { where: { iIdCredits: idCredit?.dataValues.iIdCredits } });
                const mailOptionsCustomer = {
                    from: 'pedidos@sensalon.com.mx',
                    to: `${user?.dataValues.vcemail}`, // Asumiendo que `user.email` tiene el correo electrónico del cliente
                    subject: `Confirmación de Pago - ${idCredit?.dataValues.iIdCredits}`,
                    html: `
                        <h1>Confirmación del pago de su Credito</h1>
                        <p>Estimado/a ${user?.dataValues.vcfirstname} ${user?.dataValues.vclastname},</p>
                        <p>Su pago ha sido recibido y aprobado correctamente</p>
                        <p>Aquí están los detalles de su pago:</p>
                        <p>Pago: ${transaction.amount}</p>
                    `,
                };
                transporter.sendMail(mailOptionsCustomer, (err, info) => {
                    if (err) {
                        console.error('Error al enviar el correo al cliente:', err);
                    }
                    else {
                    }
                });
            }
        }
        // Actualizamos el status
        transaction.status = status;
        await transaction.save();
        if (transaction.paymentMethod === 'Transferencia Bancaria' && status === 'approved') {
            const cashbackPerc = await CashbackConf.CashbackConf.findOne();
            if (!user) {
                responseMessage = { status: 404, message: "Configuración de cashback no encontrada" };
            }
            if (!cashbackPerc) {
                responseMessage = { status: 404, message: "Configuración de cashback no encontrada" };
            }
            const useRole = user?.iFIdRole;
            if (useRole === '8337416f-7177-11ef-a9b1-0050563b') {
                cashback = transaction.amount * (cashbackPerc.getDataValue('cashbackpercentage') / 100);
                // Verificar si ya existe un registro de cashback
                let insertCashback;
                const existingCashback = await Cashback.Cashback.findOne({
                    where: { FiIdUser: userid, FiIdTransaction: transaction.iIdTransaction },
                });
                if (existingCashback) {
                    // Si ya existe, actualiza el cashbackamount
                    const updatedAmount = Number(existingCashback.getDataValue('cashbackamount')) + cashback;
                    insertCashback = await existingCashback.update({ cashbackamount: updatedAmount });
                }
                else {
                    // Si no existe, crea un nuevo registro
                    insertCashback = await Cashback.Cashback.create({
                        FiIdUser: userid,
                        FiIdTransaction: transaction.iIdTransaction,
                        cashbackamount: cashback,
                    });
                }
                if (!insertCashback) {
                    responseMessage = { status: 500, message: "Error al insertar o actualizar el registro de cashback" };
                }
                // Actualizar el balance de cashback del usuario
                const cashbackBalance = Number(user?.cashbackbalance) || 0;
                const newCashbackBalance = cashback + cashbackBalance;
                const updateUserBalance = await Users.default.update({ cashbackbalance: newCashbackBalance }, { where: { iIdUser: userid } });
                console.log('despues de sumar', updateUserBalance);
                if (updateUserBalance[0] > 0) {
                    // Si se actualizó el cashbackBalance, actualiza el campo cashbackapplied en Transactions
                    console.log('actualizar transaccion', transaction.iIdTransaction);
                    const updateTransaction = await Transaction.default.update({ cashbackapplied: 1 }, { where: { iIdTransaction: transaction.iIdTransaction }, silent: false });
                    console.log({ updateTransaction });
                    if (updateTransaction[0] > 0) {
                        responseMessage = { status: 200, message: "Cashback aplicado correctamente" };
                    }
                    else {
                        responseMessage = { status: 500, message: "Error al actualizar la transacción con cashbackapplied" };
                    }
                }
                else {
                    responseMessage = { status: 500, message: "Error al actualizar el balance de cashback del usuario" };
                }
            }
            const direccion = await ShippingAdd.ShippingAddresses.findOne({ where: { iIdAddressId: transaction.ishippingAddressId } });
            const direccionCompleta = `${direccion?.dataValues.vcaddress}, ${direccion?.dataValues.vcinterior}, ${direccion?.dataValues.vcsuburb},${direccion?.dataValues.vczipcode}, ${direccion?.dataValues.vccity}, ${direccion?.dataValues.vcstate},${direccion?.dataValues.vccountry, direccion?.dataValues.vcadditonalindication}`;
            let parsedProducts;
            try {
                // Si transaction.products ya es un objeto, úsalo directamente
                parsedProducts = typeof transaction.products === "string"
                    ? JSON.parse(transaction.products)
                    : transaction.products;
                // Si parsedProducts sigue siendo una cadena, intenta parsearlo una vez más
                if (typeof parsedProducts === "string") {
                    parsedProducts = JSON.parse(parsedProducts);
                }
            }
            catch (error) {
                console.error("❌ Error al parsear transaction.products:", error);
                return res.status(500).json({ message: "Error procesando los productos", error: error.message });
            }
            const companyCache = {};
            const groupedProducts = {};
            const getCompanyNameById = async (idCompany) => {
                if (companyCache[idCompany]) {
                    return companyCache[idCompany]; // Retorna el nombre si ya está en caché
                }
                try {
                    console.log('obteniendo nombre', idCompany);
                    const company = await Companies.Companies.findOne({ where: { iIdCompany: idCompany } }); // Consulta la base de datos
                    const companyName = company?.getDataValue('vcname') || "Compañía Desconocida";
                    console.log(companyName);
                    companyCache[idCompany] = companyName; // Guarda en caché para futuras consultas
                    return companyName;
                }
                catch (error) {
                    console.error("Error al obtener el nombre de la compañía:", error);
                    return "Compañía Desconocida";
                }
            };
            for (const product of parsedProducts) {
                console.log('estamos en products', product);
                // Corregir el destructuring para obtener 'companie' en lugar de 'idCompany'
                const { companie: idCompany, name, quantity } = product;
                console.log(idCompany);
                // Obtener el nombre de la compañía si existe el ID
                let companyName = idCompany ? await getCompanyNameById(idCompany) : "Sin Compañía";
                // Agrupar productos por el nombre de la compañía
                if (!groupedProducts[companyName]) {
                    groupedProducts[companyName] = [];
                }
                groupedProducts[companyName].push({ name, quantity });
            }
            const productsTable = Object.entries(groupedProducts).map(([companyName, products]) => {
                const productsRows = products.map(({ name, quantity }) => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${quantity}</td>
                    </tr>
                `).join('');
                return `
                    <tr>
                        <td colspan="2" style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; font-weight: bold;">
                            ${companyName}
                        </td>
                    </tr>
                    ${productsRows}
                `;
            }).join('');
            console.log(productsTable);
            const htmlContent = `
                                 <h1>Detalles de la Transacción</h1>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Campo</th>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Valor</th>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">Orden de compra</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${transaction.iIdTransaction}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">Status</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${status}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">Monto</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">$${parseFloat(transaction.amount).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">Nombre del Cliente</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${user?.vcfirstname + user.vclastname}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">Dirección</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${direccionCompleta}</td>
                                    </tr>
                                </table>
                                <h2>Productos</h2>
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                    <tr>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cantidad</th>
                                    </tr>
                                    ${productsTable}
                                </table>
                     `;
            // Una vez generado el PDF, configuramos el envío del correo
            const mailOptions = {
                from: 'pedidos@sensalon.com.mx',
                to: 'pedidos@sensalon.com.mx, pedidosaprobados@sensalon.com.mx',
                subject: `Nueva Orden de Compra - ${transaction.iIdTransaction}`,
                html: htmlContent, // Se envía también en formato HTML
            };
            config_1.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo:', err);
                }
                else {
                    console.log('Correo enviado:', info.response);
                }
            });
            const mailOptionsCustomer = {
                from: 'pedidos@sensalon.com.mx',
                to: `${user?.vcemail}`, // Asumiendo que `user.email` tiene el correo electrónico del cliente
                subject: `Confirmación de Pedido - ${transaction.iIdTransaction}`,
                html: `
                                <h1>Confirmación de Pedido</h1>
                                <p>Estimado/a ${user?.vcfirstname} ${user.vclastname},</p>
                                <p>Su pago ha sido aprobado y su pedido está siendo preparado para ser enviado.</p>
                                <p>Aquí están los detalles de su pedido:</p>
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                      <tr>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cantidad</th>
                                    </tr>
                                    ${productsTable}
                                </table>
                            `,
            };
            config_1.transporter.sendMail(mailOptionsCustomer, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo al cliente:', err);
                }
                else {
                }
            });
        }
        return res.status(responseMessage.status).json({ message: responseMessage.message });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error updating transaction status',
            error: error.message
        });
    }
};
exports.updateStatusTransaction = updateStatusTransaction;
 */