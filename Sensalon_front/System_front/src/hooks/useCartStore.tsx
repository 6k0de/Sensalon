import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState } from "../interfaces/cartState";
import { getCartByUser, getCartItemsByUser, saveCartItems } from "../services/Cart/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
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

      // ✅ Cargar carrito desde backend al iniciar sesión
      setCartFromBackend: async (userId: string) => {
        try {
          const cart = await getCartByUser(userId);
          const cartItems = await getCartItemsByUser(userId);

          const mapped = cartItems.map((ci: any) => ({
            product: ci.product,
            quantity: ci.iquantity,
          }));

          set({ cart: mapped, cartId: cart.iIdCart });
        } catch (err) {
          console.error("Error cargando carrito:", err);
        }
      },

      // ✅ Guardar carrito en backend al cerrar sesión
      syncCartToBackend: async (cartId: string) => {
        try {
          const { cart } = get();
          const items = cart.map((item) => ({
            iFIdProduct: item.product.iIdProduct,
            iquantity: item.quantity,
            decprice: item.product.decprice1 ?? item.product.decprice2 ?? item.product.decprice3,
          }));
          await saveCartItems(cartId, items);
        } catch (err) {
          console.error("Error guardando carrito:", err);
        }
      },

      // ✅ Limpiar carrito (logout)
      clearCart: () => set({ cart: [] }),
    }),
    { name: "cart-storage" }
  )
);
