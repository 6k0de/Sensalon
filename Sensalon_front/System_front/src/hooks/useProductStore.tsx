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

const CACHE_PREFIX = "products:byUser:v2";
const LEGACY_CACHE_KEY = "products:byUser";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

const getUserIdentity = () => {
  const u = readUser();
  if (!u) {
    return { userId: "guest", roleId: "guest", isGuest: true };
  }

  const userId =
    u?.user?.iIdUser ||
    u?.user?.id ||
    u?.iIdUser ||
    u?.id ||
    "unknown";
  const roleId =
    u?.user?.iFIdRole ||
    u?.user?.roleId ||
    u?.iFIdRole ||
    u?.roleId ||
    "unknown";

  return { userId: String(userId), roleId: String(roleId), isGuest: false };
};

const getCacheKey = () => {
  const identity = getUserIdentity();
  if (identity.isGuest) return `${CACHE_PREFIX}:guest`;
  return `${CACHE_PREFIX}:${identity.userId}:${identity.roleId}`;
};

const purgeOtherCaches = (keepKey: string) => {
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY);
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX) && key !== keepKey) {
        localStorage.removeItem(key);
      }
    });
  } catch { }
};

const readCache = (): Product[] => {
  try {
    const key = getCacheKey();
    purgeOtherCaches(key);
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;

    const ts = Number(parsed?.ts || 0);
    const items = parsed?.items;

    if (!Array.isArray(items)) return [];
    if (ts && Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return [];
    }
    return items;
  } catch {
    return [];
  }
};

const writeCache = (products: Product[]) => {
  try {
    const key = getCacheKey();
    purgeOtherCaches(key);
    const payload = {
      ts: Date.now(),
      items: products,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch { }
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
      const freshRaw: Product[] = Array.isArray(resp.data)
        ? resp.data
        : (resp.data?.products ?? []);

      // Agrupa variantes bajo su padre: el padre es quien NO tiene relatedproductId,
      // los hijos son producttype === 'VARIANT' con relatedproductId.
      const map: Record<string, any> = {};
      freshRaw.forEach((p) => {
        map[p.iIdProduct] = { ...p, childrenVariants: [] };
      });

      freshRaw.forEach((p) => {
        if (p.producttype === "VARIANT" && p.relatedproductId) {
          const parent = map[p.relatedproductId];
          if (parent) {
            parent.childrenVariants.push(p);
          }
        }
      });

      const fresh = Object.values(map);
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
