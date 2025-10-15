import { payment } from "../../utils/axiosClients";

export const getTransfer = async () => {
  try {
    const response = await payment.get(
      "/infoTransfer",
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion bancaria");
  }
};
