// helpers/buildTransactionHtml.ts
import { Companies } from "../bd/models/Companies.model";
import { Users } from "../bd/models/Users.model";
import { getFullAddress } from "./getFullAddres";

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

// cache simple en memoria
const getCompanyNameById = async (idCompany: number | string, cache: Record<string, string>) => {
  const key = String(idCompany);
  if (cache[key]) return cache[key];
  const company = await Companies.findOne({ where: { iIdCompany: idCompany } });
  const name = company?.dataValues?.vcname || "Compañía desconocida";
  cache[key] = name;
  return name;
};

export const buildTransactionHtml = async (
  transaction: any,
  preOrder: any,
  direccion?: any,
  isApproved?: boolean
) => {

  const direccionCompleta = await getFullAddress(direccion)
  console.log(transaction)
  // 1) Normalizar productos
  let products: any[] = [];
  try {
    if (Array.isArray(transaction.products)) products = transaction.products;
    else if (typeof transaction.products === "string") products = JSON.parse(transaction.products || "[]");
    else if (transaction.products && transaction.products.Producto) {
      // Caso Pago de crédito u otro “producto” simbólico
      products = [{ name: transaction.products.Producto, quantity: 1, price: preOrder.total, companyId: null }];
    }
  } catch {
    products = [];
  }

  // 2) Agrupar por compañía (acepta companyId | companie)
  const cache: Record<string, string> = {};
  const grouped: Record<string, { name: string; quantity: number; priceUnit: number }[]> = {};

  console.log(products)
  for (const p of products) {
    const companyId = p.companyId ?? p.companie ?? null;
    const companyName = companyId ? await getCompanyNameById(companyId, cache) : "Sin compañía";
    const name = p.name ?? p.Producto ?? "Producto";
    const quantity = Number(p.quantity ?? 1);
    const priceUnit = Number(p.priceUnit ?? 0);

    if (!grouped[companyName]) grouped[companyName] = [];
    grouped[companyName].push({ name, quantity, priceUnit });
  }

  // 3) Render de tabla por compañía
  const productsTable = Object.entries(grouped).map(([companyName, items]) => {
    const sub = items.reduce((acc, it) => acc + it.priceUnit * it.quantity, 0);
    const rows = items.map(it => `
      <tr>
        <td style="border:1px solid #ddd;padding:8px;">${it.name}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:center;">${it.quantity}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right;">${mxn(it.priceUnit)}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right;">${mxn(it.priceUnit * it.quantity)}</td>
      </tr>
    `).join("");

    return `
      <tr>
        <td colspan="4" style="background:#f0f0f0;font-weight:bold;padding:8px;border:1px solid #ddd;">
          ${companyName}
        </td>
      </tr>
      ${rows}
      <tr style="font-weight:bold;background:#fafafa;">
        <td colspan="3" style="border:1px solid #ddd;padding:8px;text-align:right;">Subtotal ${companyName}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right;">${mxn(sub)}</td>
      </tr>
    `;
  }).join("");

  // Identificador visible: usa iIdTransaction si existe; si no, mercadoPagoPaymentId
  const txId = transaction.iIdTransaction || transaction.mercadoPagoPaymentId || "—";
  const user = await Users.findOne({ where: { iIdUser: transaction.iuserId } });
  const userName = user?.getDataValue('vcfirstname') + ' ' + user?.getDataValue('vclastname') || "Usuario desconocido";

  return `
  <div style="font-family:Arial,sans-serif;padding:20px;">
    <div style="max-width:480px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06)">
      <div style="background:#4f46e5;color:white;padding:18px;text-align:center;">
        <h2 style="margin:0;font-size:20px;">Transferencia Bancaria</h2>
      </div>

      <div style="padding:20px;">
        <h3 style="margin:0 0 10px 0;">Detalles de la Transacción</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Orden</th>
              <td style="border:1px solid #eee;padding:8px;">${txId}</td>
          </tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Usuario</th>
              <td style="border:1px solid #eee;padding:8px;">${userName}</td>
          </tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Estatus</th>
              <td style="border:1px solid #eee;padding:8px;">${isApproved ? 'approved' : transaction.status}</td></tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Monto</th>
              <td style="border:1px solid #eee;padding:8px;">${mxn(Number(transaction.amount || 0))}</td></tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Dirección</th>
              <td style="border:1px solid #eee;padding:8px;">${direccionCompleta}</td></tr>
        </table>

        <h3 style="margin:20px 0 10px 0;">Productos</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#eef2ff;">
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Producto</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:center;">Cantidad</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Precio</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Total</th>
          </tr>
          ${productsTable || `
            <tr><td colspan="4" style="border:1px solid #ddd;padding:10px;text-align:center;color:#777;">
              No hay productos asociados.
            </td></tr>`}
        </table>

        <h3 style="margin:20px 0 10px 0;">Resumen</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="border:1px solid #eee;padding:8px;">Subtotal</td>
              <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(preOrder.subtotal || 0)}</td></tr>
          <tr><td style="border:1px solid #eee;padding:8px;">Envío</td>
              <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(preOrder.shipping || 0)}</td></tr>
          <tr><td style="border:1px solid #eee;padding:8px;">Crédito aplicado</td>
              <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(preOrder.credit || 0)}</td></tr>
          <tr><td style="border:1px solid #eee;padding:8px;">Cashback usado</td>
              <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(preOrder.cashback || 0)}</td></tr>
          <tr style="font-weight:bold;background:#fafafa;">
              <td style="border:1px solid #eee;padding:8px;">TOTAL</td>
              <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(preOrder.total || 0)}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;
};
