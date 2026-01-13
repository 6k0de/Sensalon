// helpers/buildTransactionHtml.ts
import { Companies } from "../bd/models/Companies.model";
import { ShippingAddresModel } from "../bd/models/ShippingAdd.model";
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
  const hasDireccionValue =
    typeof direccion === "string" || (typeof direccion === "object" && direccion !== null);
  const direccionCompleta = await getFullAddress(
    hasDireccionValue ? direccion : transaction?.ishippingAddressId
  );
  let telefono = "";

  if (direccion && typeof direccion === "object") {
    telefono = direccion.vcphone || direccion.phone || direccion.vccellphone || "";
  }

  if (!telefono) {
    const candidateId =
      typeof direccion === "string" ? direccion : transaction?.ishippingAddressId;

    if (candidateId && /^[0-9a-fA-F-]{36}$/.test(String(candidateId))) {
      const dir = await ShippingAddresModel.findOne({ where: { iIdAddressId: candidateId } });
      telefono = dir?.dataValues?.vcphone || "";
    }
  }

  // 1) Normalizar productos + meta
  let products: any[] = [];
  let meta: any = null;

  try {
    let raw = transaction.products;

    // Si viene del modelo como string JSON
    if (typeof raw === "string") {
      raw = JSON.parse(raw || "[]");
    }

    // 🧠 Formato NUEVO: { items: [...], meta: {...} }
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      if (Array.isArray(raw.items)) {
        products = raw.items;
      }
      if (raw.meta) {
        meta = raw.meta;
      }
    }
    // 🧠 Formato VIEJO: array directo de productos
    else if (Array.isArray(raw)) {
      products = raw;
    }
    // 🧠 Formato súper viejo: { Producto: 'texto' }
    else if (raw && (raw as any).Producto) {
      products = [{
        name: (raw as any).Producto,
        quantity: 1,
        priceUnit: preOrder.total,
        companyId: null,
      }];
    }
  } catch (err) {
    console.error("Error parseando transaction.products en buildTransactionHtml:", err);
    products = [];
  }

  // 2) Agrupar por compañía (acepta companyId | companie)
  const cache: Record<string, string> = {};
  const grouped: Record<string, { name: string; quantity: number; priceUnit: number }[]> = {};

  for (const p of products) {
    const companyId = p.companyId ?? p.companie ?? null;
    const companyName = companyId
      ? await getCompanyNameById(companyId, cache)
      : "Sin compañía";

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

  // 4) Resumen usando meta si existe
  const n = (v: any, def = 0) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : def;
  };

  // Valores base desde preOrder (para órdenes viejas)
  let resumen = {
    subtotal: n(preOrder.subtotal),
    shipping: n(preOrder.shipping),
    discount: 0,
    discountCode: null as string | null,
    credit: n(preOrder.credit),
    cashback: n(preOrder.cashback),
    total: n(preOrder.total || transaction.amount),
  };

  // Si hay meta, la usamos para refinar el resumen
  if (meta) {
    resumen = {
      subtotal: n(meta.subtotalAfterDiscount ?? meta.rawSubtotal ?? resumen.subtotal),
      shipping: n(meta.shipping ?? resumen.shipping),
      discount: n(meta.discount ?? 0),
      discountCode: meta.discountCode ?? null,
      credit: n(meta.credit ?? resumen.credit),
      cashback: n(meta.cashback ?? resumen.cashback),
      total: n(meta.total ?? resumen.total),
    };
  }

  // 5) Identificador de transacción y usuario
  const txId = transaction.iIdTransaction || transaction.mercadoPagoPaymentId || "—";
  const user = await Users.findOne({ where: { iIdUser: transaction.iuserId } });
  const userName =
    (user?.getDataValue("vcfirstname") || "") +
      " " +
      (user?.getDataValue("vclastname") || "") ||
    "Usuario desconocido";

  // 6) Filas condicionales del resumen
  const discountRow =
    resumen.discount > 0
      ? `
        <tr>
          <td style="border:1px solid #eee;padding:8px;">Descuento${resumen.discountCode ? ` (${resumen.discountCode})` : ""}</td>
          <td style="border:1px solid #eee;padding:8px;text-align:right;">- ${mxn(resumen.discount)}</td>
        </tr>
      `
      : "";

  const creditRow = `
    <tr>
      <td style="border:1px solid #eee;padding:8px;">Crédito aplicado</td>
      <td style="border:1px solid #eee;padding:8px;text-align:right;">
        ${resumen.credit > 0 ? `- ${mxn(resumen.credit)}` : mxn(0)}
      </td>
    </tr>
  `;

  const cashbackRow = `
    <tr>
      <td style="border:1px solid #eee;padding:8px;">Cashback usado</td>
      <td style="border:1px solid #eee;padding:8px;text-align:right;">
        ${resumen.cashback > 0 ? `- ${mxn(resumen.cashback)}` : mxn(0)}
      </td>
    </tr>
  `;

  const metaNote = !meta
    ? `
      <p style="margin-top:8px;font-size:12px;color:#666;line-height:1.4;">
        Nota: este pedido se generó sin desglose detallado. El total puede incluir
        costos o descuentos adicionales (envío, créditos o cashback) que no se
        muestran aquí por separado.
      </p>
    `
    : "";

  // 7) HTML final
  return `
  <div style="font-family:Arial,sans-serif;padding:20px;">
    <div style="max-width:480px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06)">
      <div style="background:#4f46e5;color:white;padding:18px;text-align:center;">
        <h2 style="margin:0;font-size:20px;">${transaction.paymentMethod || "Transacción"}</h2>
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
              <td style="border:1px solid #eee;padding:8px;">${isApproved ? "approved" : transaction.status}</td></tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Monto</th>
              <td style="border:1px solid #eee;padding:8px;">${mxn(Number(transaction.amount || 0))}</td></tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Dirección</th>
              <td style="border:1px solid #eee;padding:8px;">${direccionCompleta}</td></tr>
          <tr><th style="border:1px solid #eee;padding:8px;text-align:left;">Teléfono</th>
              <td style="border:1px solid #eee;padding:8px;">${telefono || "Sin teléfono registrado"}</td></tr>
        </table>

        <h3 style="margin:20px 0 10px 0;">Productos</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#eef2ff;">
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Producto</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:center;">Cantidad</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Precio</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Total</th>
          </tr>
          ${
            productsTable ||
            `
            <tr><td colspan="4" style="border:1px solid #ddd;padding:10px;text-align:center;color:#777;">
              No hay productos asociados.
            </td></tr>`
          }
        </table>

        <h3 style="margin:20px 0 10px 0;">Resumen</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="border:1px solid #eee;padding:8px;">Subtotal</td>
            <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(resumen.subtotal)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td style="border:1px solid #eee;padding:8px;">Envío</td>
            <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(resumen.shipping)}</td>
          </tr>
          ${creditRow}
          ${cashbackRow}
          <tr style="font-weight:bold;background:#fafafa;">
            <td style="border:1px solid #eee;padding:8px;">TOTAL</td>
            <td style="border:1px solid #eee;padding:8px;text-align:right;">${mxn(resumen.total)}</td>
          </tr>
        </table>
        ${metaNote}
      </div>
    </div>
  </div>`;
};
