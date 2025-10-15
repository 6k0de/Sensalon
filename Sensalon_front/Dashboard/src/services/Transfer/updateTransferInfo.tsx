import { payment } from "../../utils/axiosClients";

export const updateTransferInfo = async (payload: any) => {
  try {
    const response = await payment.put(
      "/infoTransferUpdate",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion bancaria");
  }
};
