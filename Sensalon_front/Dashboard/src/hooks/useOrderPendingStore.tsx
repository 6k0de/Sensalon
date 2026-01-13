import { create } from "zustand";
import { api } from "../utils/axiosClients";
import { OrderPending } from "../interfaces/ordersPending";

interface OrderPendingStore {
  orders: OrderPending[];
  fetchOrdersPending: () => Promise<void>;
}

export const useOrderPendingStore = create<OrderPendingStore>((set) => ({
  orders: [],
  fetchOrdersPending: async () => {
    try {
      const resp = await api.get("/orderspending");
      set({ orders: resp.data || [] });
    } catch (error) {
      console.error("Error al cargar las ordenes pendientes:", error);
    }
  },
}));
