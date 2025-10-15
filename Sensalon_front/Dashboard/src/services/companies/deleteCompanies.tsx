import { api } from "../../utils/axiosClients";

export const DeleteCompanies = async (id: string) => {
    try {
        const resultado = await api.post(`/deletecompanies/${id}`);
        return resultado.data;
    } catch (error) {
        console.error('Error eliminando la compania: ', error);
        throw error; 
    }
};
