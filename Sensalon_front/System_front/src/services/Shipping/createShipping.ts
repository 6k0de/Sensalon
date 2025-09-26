import { ShippingAddressRequest } from "../../interfaces/shippingAdd";
import { api } from "../../utils/axiosClients";

export const createShipping = async (idUser: string, data: ShippingAddressRequest) => {
    try {
        const insertShipping = await api.post(`/createshipping/${idUser}`, data)
        if (insertShipping.data.data === 1) {
            return { data: insertShipping.data.data, message: insertShipping.data.message }
        } else {
            return { data: insertShipping.data.data, message: insertShipping.data.message }
        }
    } catch (error) {
        console.error('Error al crear la dirección de envío:', error);
        return { data: 0, message: 'Error en el servidor' }
    }
}