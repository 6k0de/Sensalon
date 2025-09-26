import { create } from 'zustand';
import { api } from '../utils/axiosClients';

interface DistributorStore {
  distribuidores:{distribuidores: any[]};
  fetchDistribuidores: () => Promise<void>;
}

export const useDistributorStore = create<DistributorStore>((set) => ({
  distribuidores:{ distribuidores: []},
  fetchDistribuidores: async () => {
    try {
      const resp = await api.get('/distributors');
      set({ distribuidores: resp.data });
    } catch (error) {
      console.error('Error al cargar distribuidores:', error);
    }
  }
}));
