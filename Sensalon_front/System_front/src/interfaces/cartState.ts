import { CartItem } from "./cartItem";
import { Product } from "./products";

export interface CartState {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
}