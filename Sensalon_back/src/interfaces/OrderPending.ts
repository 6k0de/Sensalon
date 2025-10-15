export interface OrderPendingAttributes {
  iIdOrderPending: number;
  iIdUser: string;
  iIdShippingAddress: string;
  products: any; // JSON
  subtotal: number;
  shipping: number;
  cashback: number;
  credit: number;
  total: number;
  status: "pending" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}