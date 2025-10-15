import { api } from "../../utils/axiosClients";

export const deleteSupplier = async (id: string) => {
    try {
        const response = await api.delete(`/deletesupplier/${id}`)
        return response.data
    } catch (error) {
        console.error("Error deleting supplier:", error);
        throw error
    }
}