import { payment } from "../../utils/axiosClients";


export const updateStatusTransaction = async (id: string, status: string) => {
    try {
        const response = await payment.post(`/updateStatusTransaction/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating transaction status:", error);
        throw error;
    }
};