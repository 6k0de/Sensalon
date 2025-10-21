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
          const stock = Number(product.istock ?? 0);

          // Si no hay stock, no agregamos nada
          if (stock <= 0) {
            return state; // opcional: podrías mostrar un toast de “sin stock”
          }

          if (existingItem) {
            // Evitar pasar el stock máximo
            const newQty = Math.min(existingItem.quantity + 1, stock);
            return {
              cart: state.cart.map((item) =>
                item.product.iIdProduct === product.iIdProduct
                  ? { ...item, quantity: newQty }
                  : item
              ),
            };
          } else {
            // Primera vez que se agrega
            return {
              cart: [...state.cart, { product, quantity: 1 }],
            };
          }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.product.iIdProduct === productId) {
              const stock = Number(item.product.istock ?? 0);
              const newQty = Math.max(0, Math.min(quantity, stock)); // entre 1 y stock
              return { ...item, quantity: newQty };
            }
            return item;
          }),
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
