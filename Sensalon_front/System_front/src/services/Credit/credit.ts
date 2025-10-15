import { api, payment } from "../../utils/axiosClients";

export const getCreditByUserId = async (userId: string) => {
    const response = await api.get(`/credit/${userId}`);
    const data = await response.data;
    return data;
}

export const getCreditPayByCreditId = async (creditId: string) => {
    const response = await api.get(`/creditpay/${creditId}`);
    const data = await response.data;
    return data;
}

export const createOrderTransferPayCredit = async (formData: FormData) => {
    const { data } = await payment.post(`/createOrderTransferPayCredit`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return data;
}
