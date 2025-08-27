import { create } from 'zustand';
import axios from 'axios';

interface UserStore {
    users: { usuarios: any[] };  // 'users' es un objeto que contiene 'usuarios' como array
    fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    users: { usuarios: [] },  // Inicializa como un objeto con la propiedad 'usuarios'
    fetchUsers: async () => {
        try {
            const resp = await axios.get('http://localhost:3000/api/usersn');
            set({ users: { usuarios: resp.data.usuarios } });  // Asegúrate de que los datos sean asignados correctamente
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }
}));
