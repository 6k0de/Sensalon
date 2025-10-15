import { payment } from "../../utils/axiosClients";

export const getInfoTransfer = async() => {
    const response = await payment.get(`/infoTransfer`);
    const data = await response.data;
    return data;
}