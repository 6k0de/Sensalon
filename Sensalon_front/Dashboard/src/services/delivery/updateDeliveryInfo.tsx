import axios from "axios";

export const updateDeliveryInfo = async (seEnvia: any) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/payments/deliveryUpdate",
      { seEnvia },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion del envio");
  }
};
