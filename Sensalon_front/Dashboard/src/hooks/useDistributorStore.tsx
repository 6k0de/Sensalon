import { create } from 'zustand';
import axios from 'axios';

interface DistributorStore {
  distribuidores:{distribuidores: any[]};
  fetchDistribuidores: () => Promise<void>;
}

export const useDistributorStore = create<DistributorStore>((set) => ({
  distribuidores:{ distribuidores: []},
  fetchDistribuidores: async () => {
    try {
      const resp = await axios.get('http://localhost:3000/api/distributors');
      set({ distribuidores: resp.data });
    } catch (error) {
      console.error('Error al cargar distribuidores:', error);
    }
  }
}));
