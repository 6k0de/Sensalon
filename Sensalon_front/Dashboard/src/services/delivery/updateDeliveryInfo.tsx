import { payment } from "../../utils/axiosClients";

export const updateDeliveryInfo = async (seEnvia: any) => {
  try {
    const response = await payment.put(
      "/deliveryUpdate",
      { seEnvia },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al actualizar la informacion del envio");
  }
};
