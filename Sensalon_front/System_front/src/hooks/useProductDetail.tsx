import { useState, useEffect } from "react";
import { Product } from "../interfaces/products";
import { api } from "../utils/axiosClients";


export const useProductDetail = (id: string) => {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProductById = async () => {
            try {
                const resp = await api.get(`/producto/${id}`)
                if(!resp.data) throw new Error('Producto no encontrado')
                setProduct(resp.data)
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false)
            }
        }   

        fetchProductById()
    }, [id])

    return {product, loading, error}
}