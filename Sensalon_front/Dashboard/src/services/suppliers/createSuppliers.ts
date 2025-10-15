import { Supplier } from "../../interfaces/suppliers";
import { api } from "../../utils/axiosClients";

export const createSupplier = async (formData: Supplier) => {
    try {
        const response = await api.post('/createsupplier', formData)
        return response.data
    } catch (error) {
        console.error("Error creating supplier:", error);
        throw error
    }
}