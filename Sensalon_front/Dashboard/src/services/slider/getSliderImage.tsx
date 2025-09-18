import axios from "axios";

export const getSliderImages = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/sliderImage");
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener las imágenes del slider");
  }
};
