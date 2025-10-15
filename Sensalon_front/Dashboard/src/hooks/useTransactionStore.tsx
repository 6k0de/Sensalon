import { create } from "zustand";
import { Transaction } from "../interfaces/transactions";
import { api } from "../utils/axiosClients";

interface TransactionStore {
    transaction: { transaction: Transaction[] };  // 'users' es un objeto que contiene 'usuarios' como array
    fetchTransaction: () => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
    transaction: { transaction: [] },  // Inicializa como un objeto con la propiedad 'usuarios'
    fetchTransaction: async () => {
        try {
            const resp = await api.get('/transactions');
            set({ transaction: { transaction: resp.data } });  // Asegúrate de que los datos sean asignados correctamente
        } catch (error) {
            console.error('Error al cargar las transacciones:', error);
        }
    }
}))