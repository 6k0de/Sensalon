import axios from "axios";
import { api } from "../../utils/axiosClients";

export const uploadSliderImage = async (formData: FormData) => {
  try {
    const response = await api.post(
      "/slider",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Error del servidor");
    } else {
      throw new Error("Error inesperado al subir imágenes");
    }
  }
};
