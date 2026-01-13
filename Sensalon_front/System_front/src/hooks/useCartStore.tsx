import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState } from "../interfaces/cartState";
import { CartItem } from "../interfaces/cartItem";
import { getCartByUser, getCartItemsByUser, saveCartItems } from "../services/Cart/cart";
import { Product } from "../interfaces/products";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const buildCartItemsPayload = (cart: CartItem[]) =>
        cart.map((item) => ({
          iFIdProduct: item.product.iIdProduct,
          iquantity: item.quantity,
          decprice:
            item.product.decprice1 ??
            item.product.decprice2 ??
            item.product.decprice3 ??
            0,
        }));

      const getCartSignature = (cart: CartItem[]) =>
        cart.map((item) => `${item.product.iIdProduct}:${item.variantId ?? ""}:${item.quantity}`).join("|");

      const persistCart = async (cart: CartItem[]) => {
        const cartId = get().cartId || localStorage.getItem("cartId");
        if (!cartId) return;
        try {
          await saveCartItems(cartId, buildCartItemsPayload(cart));
        } catch (err: any) {
          console.error("Error guardando carrito:", err?.response?.data || err?.message || err);
        }
      };

      return {
        cart: [],
        _cartTimerId: null,

        addToCart: (product: Product, opts) => {
          const prevSignature = getCartSignature(get().cart);

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
          });

          const nextCart = get().cart;
          const nextSignature = getCartSignature(nextCart);
          if (nextSignature !== prevSignature) {
            void persistCart(nextCart);
          }
        },

        updateQuantity: (productId, quantity, variantId) => {
          const prevSignature = getCartSignature(get().cart);

          set((state) => {
            const updated = state.cart
              .map((item) => {
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
              })
              .filter((item) => item.quantity > 0); // si queda en 0, se elimina del carrito

            return { cart: updated };
          });

          const nextCart = get().cart;
          const nextSignature = getCartSignature(nextCart);
          if (nextSignature !== prevSignature) {
            void persistCart(nextCart);
          }
        },

        removeFromCart: (productId, variantId) => {
          const prevSignature = getCartSignature(get().cart);

          set((state) => ({
            cart: state.cart.filter(
              (item) =>
                !(
                  item.product.iIdProduct === productId &&
                  (variantId ? item.variantId === variantId : true)
                )
            ),
          }));

          const nextCart = get().cart;
          const nextSignature = getCartSignature(nextCart);
          if (nextSignature !== prevSignature) {
            void persistCart(nextCart);
          }
        },

        // ✅ Cargar carrito desde backend al iniciar sesión
        setCartFromBackend: async (userId: string) => {
          try {
            const currentLocal = get().cart;
            const cart = await getCartByUser(userId);
            const cartItems = await getCartItemsByUser(userId);

            const mapped = cartItems.map((ci: any) => ({
              product: ci.product,
              quantity: ci.iquantity,
            }));

            // Si el backend está vacío pero el cliente tiene items, sube los locales
            if (mapped.length === 0 && currentLocal.length > 0) {
              const items = buildCartItemsPayload(currentLocal);
              await saveCartItems(cart.iIdCart, items);
              set({ cart: currentLocal, cartId: cart.iIdCart });
              return;
            }

            set({ cart: mapped, cartId: cart.iIdCart });
          } catch (err) {
            console.error("Error cargando carrito:", err);
          }
        },

        // ✅ Guardar carrito en backend al cerrar sesión
        syncCartToBackend: async (cartId: string) => {
          try {
            const resolvedCartId = cartId || get().cartId || localStorage.getItem("cartId");
            if (!resolvedCartId) return;
            const { cart } = get();
            const items = buildCartItemsPayload(cart);
            await saveCartItems(resolvedCartId, items);
          } catch (err) {
            console.error("Error guardando carrito:", err);
          }
        },

        // ✅ Limpiar carrito (logout)
        clearCart: () => {
          const existing = get()._cartTimerId;
          if (existing) window.clearInterval(existing as unknown as number);
          set({ cart: [], _cartTimerId: null });
        },

        startAutoRefreshCart: (userId: string, intervalMs = 3 * 60 * 1000) => {
          const existing = get()._cartTimerId;
          if (existing) window.clearInterval(existing as unknown as number);

          // refresh inmediato
          get().setCartFromBackend(userId);

          const id = window.setInterval(() => {
            get().setCartFromBackend(userId);
          }, intervalMs);

          set({ _cartTimerId: id as unknown as number });
        },

        stopAutoRefreshCart: () => {
          const existing = get()._cartTimerId;
          if (existing) window.clearInterval(existing as unknown as number);
          set({ _cartTimerId: null });
        },
      };
    },
    { name: "cart-storage" }
  )
);
