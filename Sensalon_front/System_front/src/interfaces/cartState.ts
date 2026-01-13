import { CartItem } from "./cartItem";
import { Product } from "./products";

export interface CartState {
    cart: CartItem[];
    cartId?: string;
    _cartTimerId?: number | null;
    addToCart: (product: Product, opts?: { quantity?: number; variantId?: string; variantLabel?: string; comment?: string }) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    setCartFromBackend: (userId: string) => void;
    clearCart: () => void;
    syncCartToBackend: (cartId: string) => void;
    startAutoRefreshCart: (userId: string, intervalMs?: number) => void;
    stopAutoRefreshCart: () => void;
}
