import { api } from "../../utils/axiosClients";

export const getSliderImages = async () => {
  try {
    const response = await api.get("/sliderImage");
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener las imágenes del slider");
  }
};
