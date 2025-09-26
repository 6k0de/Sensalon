import { create } from 'zustand';
import { api } from '../utils/axiosClients';

interface SalonStore {
  salones:{salones: any[]};
  fetchSalones: () => Promise<void>;
}

export const useSalonStore = create<SalonStore>((set) => ({
  salones: {salones: []},
  fetchSalones: async () => {
    try {
      const resp = await api.get('/salons');
      set({ salones: resp.data });
    } catch (error) {
      console.error('Error al cargar salones:', error);
    }
  }
}));
