import { Order, OrderItem } from "../interfaces/orders";

// shapes que devuelve tu SP
export interface OrderMeta {
  subtotalParsed?: number;
  subtotalAfterDiscount?: number;
  discount?: number;
  discountCode?: string;
  shipping?: number;
  cashback?: number;
  credit?: number;
  total?: number;
  flags?: {
    addCredit: boolean;
    useCashback: boolean;
  };
}

export type ApiOrder = {
  iIdTransaction: string;
  status: 'pending' | 'approved' | 'error' | null | '';
  amount: string | number;
  iuserId: string;
  paymentMethod: string;
  products: string | null; // JSON string array
  urltransferrecipt: string | string[] | null;

  ship_country: string | null;
  ship_state: string | null;
  ship_suburb: string | null; // (colonia)
  ship_city: string | null;
  ship_zipcode: string | null;
  ship_address: string | null;
  ship_additional: string | null;

  cashback_received: string | number | null; // puedes ignorarlo si tu interfaz no lo necesita
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// tu OrderStatus solo admite 'processing' | 'approved' | 'error'
const mapStatusToOrderStatus = (s: ApiOrder['status']): 'processing' | 'approved' | 'error' => {
  console.log('status', s);
  if ((s || '').trim() === 'approved') return 'approved';
  if ((s || '').trim() === 'error') return 'error';
  // 'pending', 'error', null o '' -> 'processing'
  return 'processing';
};


function parseProductsObject(raw: ApiOrder['products']): {
  items: any[];
  meta: any | null;
} {
  if (!raw || raw === "null") return { items: [], meta: null };

  let parsed: any = raw;

  try {
    if (typeof raw === "string") {
      parsed = JSON.parse(raw);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    }
  } catch (e) {
    console.error("Error parseando products:", e, raw);
    return { items: [], meta: null };
  }

  // Formatos posibles
  if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.items)) {
    return {
      items: parsed.items,
      meta: parsed.meta ?? null,
    };
  }

  if (Array.isArray(parsed)) {
    return { items: parsed, meta: null };
  }

  if (parsed?.Producto) {
    return {
      items: [{
        name: parsed.Producto,
        quantity: 1,
        priceUnit: 0,
        total: 0,
        companyId: "N/A"
      }],
      meta: null
    };
  }

  return { items: [], meta: null };
}


export function mapApiOrderToOrder(o: ApiOrder): Order {
  const { items: itemsRaw, meta } = parseProductsObject(o.products);

  const items: OrderItem[] = itemsRaw.map((p: any): OrderItem => ({
    productId: p.iIdProduct ?? p.id ?? crypto.randomUUID(),
    name: p.name ?? p.productName ?? "Producto",
    price: Number(p.priceUnit ?? p.price ?? 0),
    quantity: Number(p.quantity ?? 1),
    imageUrl: typeof p.image === "string"
      ? p.image.startsWith("http") ? p.image : p.image
      : "",
  }));

  return {
    id: o.iIdTransaction,
    date: o.createdAt,
    status: mapStatusToOrderStatus(o.status),
    items,
    total: Number(o.amount ?? 0),
    paymentMethod: o.paymentMethod,
    shippingAddress: {
      street: o.ship_address ?? "",
      city: o.ship_city ?? "",
      state: o.ship_state ?? "",
      zipCode: o.ship_zipcode ?? "",
      country: o.ship_country ?? "",
    },
    meta: meta || null,  // 👈 AHORA TAMBIÉN GUARDAMOS META
  };
}
