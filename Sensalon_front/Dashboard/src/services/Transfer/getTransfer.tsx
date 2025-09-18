import axios from "axios";

export const getTransfer = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/payments/infoTransfer",
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener la informacion bancaria");
  }
};
