import { OrderPending } from "../../interfaces/ordersPending";

export interface TableOrdersPendingProps {
  encabezados: string[];
  data: OrderPending[];
  fetch?: () => void;
  outofstock: string;
}
