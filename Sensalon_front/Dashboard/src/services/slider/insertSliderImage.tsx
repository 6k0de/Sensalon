import axios from "axios";

export const uploadSliderImage = async (formData: FormData) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/slider",
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
