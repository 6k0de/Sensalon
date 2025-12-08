import { Product } from "./products";

export interface CartItem {
    product: Product;
    quantity: number;
    variantId?: string;
    variantLabel?: string;
    bundleItemsSnapshot?: Array<{ name: string; quantity: number; price?: number }>;
    comment?: string;
}
