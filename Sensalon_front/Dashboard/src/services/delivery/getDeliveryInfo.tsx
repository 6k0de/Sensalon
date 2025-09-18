import axios from "axios";

export const getDeliveryInfo = async () => {
  try {
    const response = await axios.get("http://localhost:3000/payments/delivery");
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion del envio");
  }
};
