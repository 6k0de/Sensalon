import { payment } from "../../utils/axiosClients";

export const getDeliveryInfo = async () => {
  try {
    const response = await payment.get("/delivery");
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion del envio");
  }
};
