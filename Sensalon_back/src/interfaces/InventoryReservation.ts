export type ReservationStatus = 'reserved' | 'committed' | 'released';

export interface InventoryReservation {
  iIdInventoryReservation?: string;
  orderId: string;
  productId: string;
  qty: number;
  status: ReservationStatus;
  expiresAt: Date | null; 
  reason?: string | null;
  createdAt?: Date;          
  updatedAt?: Date;           
}
