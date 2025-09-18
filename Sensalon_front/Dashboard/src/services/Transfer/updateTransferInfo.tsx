import axios from "axios";

export const updateTransferInfo = async (payload: any) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/payments/infoTransferUpdate",
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
