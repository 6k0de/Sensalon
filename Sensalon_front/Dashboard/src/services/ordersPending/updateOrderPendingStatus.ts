import { api } from "../../utils/axiosClients";

export const updateOrderPendingStatus = async (
  id: number | string,
  status: string
) => {
  try {
    const response = await api.post(`/orderspending/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order pending status:", error);
    throw error;
  }
};
