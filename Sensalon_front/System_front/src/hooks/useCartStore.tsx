import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState } from "../interfaces/cartState";
import { getCartByUser, getCartItemsByUser, saveCartItems } from "../services/Cart/cart";
import { Product } from "../interfaces/products";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product: Product, opts) =>
        set((state) => {
          const variantId = opts?.variantId;
          const keyMatch = (item: any) =>
            item.product.iIdProduct === product.iIdProduct &&
            item.variantId === variantId;

          const existingItem = state.cart.find(keyMatch);

          // stock dependiendo del tipo
          const stock =
            product.type === "variant"
              ? Number(
                  product.variants?.find((v) => v.id === variantId)?.stock ?? product.istock ?? 0
                )
              : Number(product.istock ?? 0);

          const qtyToAdd = Math.max(1, opts?.quantity ?? 1);

          if (stock <= 0) {
            return state;
          }

          if (existingItem) {
            const newQty = Math.min(existingItem.quantity + qtyToAdd, stock);
            return {
              cart: state.cart.map((item) =>
                keyMatch(item)
                  ? { ...item, quantity: newQty, comment: opts?.comment ?? item.comment }
                  : item
              ),
            };
          }

          // snapshot for bundles
          let bundleItemsSnapshot;
          if (product.type === "bundle" && product.bundleItems) {
            bundleItemsSnapshot = product.bundleItems.map((bi) => ({
              name: bi.name || bi.productId,
              quantity: bi.quantity,
              price: bi.price,
            }));
          }

          return {
            cart: [
              ...state.cart,
              {
                product,
                quantity: Math.min(qtyToAdd, stock),
                variantId,
                variantLabel: opts?.variantLabel,
                bundleItemsSnapshot,
                comment: opts?.comment,
              },
            ],
          };
        }),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            const matches =
              item.product.iIdProduct === productId &&
              (variantId ? item.variantId === variantId : true);
            if (matches) {
              const stock =
                item.product.type === "variant"
                  ? Number(
                      item.product.variants?.find((v) => v.id === item.variantId)?.stock ??
                        item.product.istock ??
                        0
                    )
                  : Number(item.product.istock ?? 0);
              const newQty = Math.max(0, Math.min(quantity, stock));
              return { ...item, quantity: newQty };
            }
            return item;
          }),
        })),

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(item.product.iIdProduct === productId && (variantId ? item.variantId === variantId : true))
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
