import { api } from "../../utils/axiosClients";

export const deleteShipping = async (idShipping: string) => {
    try {
        const deleteShipping = await api.delete(`/deleteshipping/${idShipping}`)
        if (deleteShipping.data.data === 1) {
            return { data: deleteShipping.data.data, message: deleteShipping.data.message }
        } else {
            return { data: deleteShipping.data.data, message: deleteShipping.data.message }
        }
    } catch (error) {
        console.error('Error al crear la dirección de envío:', error);
        return { data: 0, message: 'Error en el servidor' }
    }
}