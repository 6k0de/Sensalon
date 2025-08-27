import {create} from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState } from '../interfaces/cartState';

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find(
            (item) => item.product.iIdProduct === product.iIdProduct
          );
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.iIdProduct === product.iIdProduct
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { cart: [...state.cart, { product, quantity: 1 }] };
          }
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.product.iIdProduct === productId
                ? { ...item, quantity }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.product.iIdProduct !== productId
          ),
        })),
    }),
    { name: 'cart-storage' } // Guarda en localStorage
  )
);
