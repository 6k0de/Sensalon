import { useState, useEffect } from "react";
import { Product } from "../interfaces/products";
import { api } from "../utils/axiosClients";
import { useProductStore } from "./useProductStore";

type ProductWithVariants = Product & {
    childrenVariants?: Product[];
};

export const useProductDetail = (id: string) => {
    const {
        products,
        fetchFromCache,
        startAutoRefresh,
        stopAutoRefresh,
        refreshFromServer,
    } = useProductStore();

    useEffect(() => {
        // 1) Cargar desde localStorage lo que haya
        fetchFromCache();

        // 2) (Opcional pero recomendable) refrescar desde servidor si no hay nada
        if (products.length === 0) {
            refreshFromServer().catch(() => { });
        }

        // 3) (Opcional) auto-refresh como en ProductosView
        startAutoRefresh(5 * 60 * 1000);
        return () => {
            stopAutoRefresh();
        };
        // 👇 OJO: aquí NO pongas "products" en deps, solo las funciones
    }, [fetchFromCache, refreshFromServer, startAutoRefresh, stopAutoRefresh]);


    const [product, setProduct] = useState<ProductWithVariants | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const fetchProductById = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(id, products)
                // 1) Intentar primero en el store
                let base: Product | null =
                    products.find((p) => p.iIdProduct === id) ?? null;

                console.log(base)

                // 2) Si no está en el store, ir al backend
                if (!base) {
                    const resp = await api.get(`/producto/${id}`);
                    if (!resp.data) throw new Error("Producto no encontrado");
                    base = resp.data;
                }

                if (!base || cancelled) return;

                // 3) Construir variantes a partir de la lista global `products`
                const parentId = base.relatedproductId || base.iIdProduct;

                const children = products.filter(
                    (p) =>
                        p.relatedproductId === parentId &&
                        p.iIdProduct !== base!.iIdProduct
                );

                const enriched: ProductWithVariants = {
                    ...base,
                    childrenVariants: children,
                };

                if (!cancelled) {
                    setProduct(enriched);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Error al cargar el producto");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProductById();

        return () => {
            cancelled = true;
        };
    }, [id, products]);

    return { product, loading, error };
}