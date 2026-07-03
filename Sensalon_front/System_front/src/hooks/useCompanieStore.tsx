import { create } from "zustand";
import { CompanieStore } from "../interfaces/CompanieStore";
import axios from "axios";

export const useCompanieStore = create<CompanieStore>((set) => ({
    companies: [],
    fetchCompanies: async () => {
        try {
            const resp = await axios.get('http://localhost:3000/api/empresas')
            set({ companies: resp.data })
        } catch (error) {
            console.error('Error al cargar las empresas:', error);
        }
    }
}))