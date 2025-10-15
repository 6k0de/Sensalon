import { api } from "../../utils/axiosClients";

export const deleteSliderImages = async (id: string) => {
  try {
    const response = await api.delete(
      `/sliderImage/${id}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error al eliminar la imagen del slider");
  }
};
