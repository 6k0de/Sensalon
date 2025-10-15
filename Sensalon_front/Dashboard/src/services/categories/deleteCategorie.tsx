import { api } from "../../utils/axiosClients";

export const DeleteCategorie = async (id: string) => {
    try {
        console.log('categoria a borrar: ', id);
        const resultado = await api.post(`/deletecategorie/${id}`);
        return resultado.data;
    } catch (error) {
        console.error('Error eliminando la categoria: ', error);
        throw error; 
    }
};
