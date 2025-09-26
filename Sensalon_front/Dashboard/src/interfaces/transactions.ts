interface ProductItem {
  iIdProduct: string
  name: string;
  quantity: number;
  companie?: string;
}

export interface Transaction {
  iIdTransaction: string;
  mercadoPagoPaymentId: string;
  status: string;
  amount: number;
  iuserId: string;
  ishippingAddressId?: string | null;
  merchantOrderId?: string | null;
  paymentMethod?: string | null;
  products?: any;
  urltransferrecipt?: string | null;
  cashbackapplied?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
