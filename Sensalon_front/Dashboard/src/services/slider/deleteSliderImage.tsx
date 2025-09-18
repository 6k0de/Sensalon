import axios from "axios";

export const deleteSliderImages = async (id: string) => {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/sliderImage/${id}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al eliminar la imagen del slider");
  }
};
