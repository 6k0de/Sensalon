import { Product } from "./products";

export interface ProductStore {
    products: Product[]
    fetchProducts: () => Promise<void>
}