import { CartItem } from "./cartItem";
import { Product } from "./products";

export interface CartState {
    cart: CartItem[];
    cartId?: number;
    addToCart: (product: Product) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    setCartFromBackend: (cartId: string) => void;
    clearCart: () => void;
    syncCartToBackend: (cartId: string) => void;
}