export interface Transaction {
  iIdTransaction: string; // UUID
  mercadoPagoPaymentId: string;
  status: string;
  amount: number; // DECIMAL(10,2) → number en TS
  iuserId: string; // UUID
  iOrderPendingId: number; //Índice	int(11)
  ishippingAddressId?: string | null; // opcional, puede ser null
  merchantOrderId?: string | null;
  paymentMethod?: string | null;
  products?: any; // puedes tipar mejor si conoces la estructura del JSON
  urltransferrecipt?: string | null;
  cashbackapplied?: number | null; // TINYINT → number en TS
  createdAt?: Date;
  updatedAt?: Date;
}
