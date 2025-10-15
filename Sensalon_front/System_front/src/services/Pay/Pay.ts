import { payment } from "../../utils/axiosClients";


export const createOrderTransfer = async (formData: FormData) => {
        try {
            const insertOrderTransfer = await payment.post(`/createOrderTransfer`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            console.log(insertOrderTransfer.data)
            if (insertOrderTransfer.data.data === 1) {
                return { data: insertOrderTransfer.data.data, message: insertOrderTransfer.data.message, orderNumber: insertOrderTransfer.data.orderNumber }
            } else {
                return { data: insertOrderTransfer.data.data, message: insertOrderTransfer.data.message, orderNumber: insertOrderTransfer.data.orderNumber }
            }
        } catch (error) {
            console.error('Error al crear la orden de transferencia:', error);
            return { data: 0, message: 'Error en el servidor' }
        }
}   