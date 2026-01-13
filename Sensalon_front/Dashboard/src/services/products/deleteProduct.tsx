import { api } from "../../utils/axiosClients";

export const deleteProduct = async (id: string) => {
    try {
        console.log('producto a borrar: ', id);
        const resultado = await api.post(`/deleteproduct/${id}`);
        return resultado.data;
    } catch (error: any) {
        console.error('Error eliminando el producto: ', error);
        const responseData = error?.response?.data || {};
        const message = responseData.message || 'Error al eliminar el producto';
        const detalles = responseData.detalles || null;
        const valor = responseData.valor ?? 1;
        throw { message, detalles, valor };
    }
};

export const activateProduct = async (id: string) => {
    try {
        const resultado = await api.post(`/activateproduct/${id}`);
        return resultado.data;
    } catch (error: any) {
        console.error('Error activando el producto: ', error);
        const responseData = error?.response?.data || {};
        const message = responseData.message || 'Error al activar el producto';
        const valor = responseData.valor ?? 1;
        throw { message, valor };
    }
};
