import { CartItem } from "./cartItem";
import { Product } from "./products";

export interface CartState {
    cart: CartItem[];
    cartId?: number;
    addToCart: (product: Product, opts?: { quantity?: number; variantId?: string; variantLabel?: string; comment?: string }) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    setCartFromBackend: (cartId: string) => void;
    clearCart: () => void;
    syncCartToBackend: (cartId: string) => void;
}
