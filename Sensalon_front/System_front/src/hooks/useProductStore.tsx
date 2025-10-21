// useProductStore.ts
import { create } from "zustand";
import { api } from "../utils/axiosClients";
import { isGuestUser, isNormalUser } from "../helpers/detectedUserRole";

type Product = any; // ajusta a tu interfaz real

type Store = {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchFromCache: () => void;
  refreshFromServer: () => Promise<void>;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;
  _timerId: number | null;
};

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

const readCache = (): Product[] => {
  try { return JSON.parse(localStorage.getItem("products:byUser") || "[]"); }
  catch { return []; }
};
const writeCache = (products: Product[]) => {
  localStorage.setItem("products:byUser", JSON.stringify(products));
};

export const useProductStore = create<Store>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  _timerId: null,

  // 1) Siempre pinta lo del localStorage
  fetchFromCache: () => {
    const cached = readCache();
    set({ products: cached, error: null });
  },

  // 2) Trae del backend por usuario y guarda en cache + estado
  refreshFromServer: async () => {
    try {
      set({ loading: true, error: null });

      const u = readUser();
      const userId = u?.user?.iIdUser || u?.user?.id;
      const url = userId ? `/products/${userId}` : `/productos`;

      const resp = await api.get(url);

      // Normaliza: /products/:id -> { products: [...] }, /productos -> [...]
      const fresh: Product[] = Array.isArray(resp.data)
        ? resp.data
        : (resp.data?.products ?? []);
      const PUBLIC_CATEGORY_ID = "e5625114-dcc1-11ef-9113-0050563b5fff";
      const isGuest = isGuestUser(u)
      const isNormal = isNormalUser(u)

      const filtered = (isGuest || isNormal)
        ? fresh.filter((product) => {
          try {
            const cats = JSON.parse(product.vccategories || "{}");
            const list = cats.Categorias || [];
            return list.some(
              (c: any) => c.idCategoria === PUBLIC_CATEGORY_ID
            );
          } catch {
            return false;
          }
        })
        : fresh;

      // Cache + estado
      writeCache(filtered);
      set({ products: filtered, loading: false });

      // (Opcional) Guardar también en localStorage.user.products si hay usuario
      if (userId) {
        try {
          const current = readUser() ?? {};
          const next = { ...current, products: fresh };
          localStorage.setItem("user", JSON.stringify(next));
        } catch { }
      }
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Error al refrescar productos",
      });
    }
  },

  // 3) Auto-refresh simple
  startAutoRefresh: (intervalMs = 5 * 60 * 1000) => {
    const { _timerId } = get();
    if (_timerId) window.clearInterval(_timerId);

    // pinta cache inmediato y refresca ahora
    get().fetchFromCache();
    get().refreshFromServer();

    const id = window.setInterval(() => {
      const u = readUser();
      if (!u) {
        get().stopAutoRefresh();
        return;
      }
      get().refreshFromServer();
    }, intervalMs);

    set({ _timerId: id as unknown as number });
  },

  stopAutoRefresh: () => {
    const { _timerId } = get();
    if (_timerId) {
      window.clearInterval(_timerId);
      set({ _timerId: null });
    }
  },
}));
