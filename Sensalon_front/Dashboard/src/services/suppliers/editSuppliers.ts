import { Supplier } from "../../interfaces/suppliers";
import { api } from "../../utils/axiosClients";

export const editSupplier = async (id: string, formData: Supplier) => {
    try {
        const response = await api.put(`/updatesupplier/${id}`, formData)
        return response.data
    } catch (error) {
        console.error("Error editing supplier:", error);
        throw error
    }
}