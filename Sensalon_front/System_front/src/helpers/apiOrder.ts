import { Order, OrderItem } from "../interfaces/orders";

// shapes que devuelve tu SP
export type ApiOrder = {
  iIdTransaction: string;
  status: 'pending' | 'approved' | 'error' | null | '';
  amount: string | number;
  iuserId: string;
  paymentMethod: string;
  products: string | null; // JSON string array
  urltransferrecipt: string | null;

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

// products viene como string JSON
function parseItems(raw: ApiOrder['products']): OrderItem[] {
  if (!raw || raw === 'null') return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((p: any): OrderItem => ({
      productId: p.iIdProduct ?? p.id ?? crypto.randomUUID(),
      name: p.name ?? p.productName ?? 'Producto',
      price: Number(p.priceUnit ?? p.price ?? 0),
      quantity: Number(p.quantity ?? 1),
      imageUrl: typeof p.image === 'string'
        ? p.image.startsWith('http') ? p.image : p.image // aquí podrías normalizarla si lo necesitas
        : '',
    }));
  } catch {
    return [];
  }
}

export function mapApiOrderToOrder(o: ApiOrder): Order {
    console.log('mapApiOrderToOrder', o);
  return {
    id: o.iIdTransaction,
    date: o.createdAt, // ISO string
    status: mapStatusToOrderStatus(o.status),
    items: parseItems(o.products),
    total: Number(o.amount ?? 0),
    paymentMethod: o.paymentMethod,
    shippingAddress: {
      street: o.ship_address ?? '',
      city: o.ship_city ?? '',
      state: o.ship_state ?? '',
      zipCode: o.ship_zipcode ?? '',
      country: o.ship_country ?? '',
    },
  };
}
