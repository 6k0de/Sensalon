export interface OrderPending {
  iIdOrderPending: number;
  iIdUser: string;
  iIdShippingAddress: string;
  products: any;
  subtotal: number;
  shipping: number;
  cashback: number;
  credit: number;
  total: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  user?: {
    vcfirstname: string;
    vclastname: string;
    vcemail?: string;
  };
}
