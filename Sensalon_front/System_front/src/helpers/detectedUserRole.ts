// helpers locales
export const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

// Ajusta estas comprobaciones a tu shape real del user
// helpers/roleHelpers.ts
type RoleKey = "distributor" | "salon" | "admin" | "user";

export type RoleMap = Partial<Record<RoleKey, string>>;

// ✅ Configura aquí los IDs reales de tu BD (si los tienes)
// (puedes sobrescribirlos desde donde importas con el segundo argumento de isRole*)
export const DEFAULT_ROLE_MAP: RoleMap = {
  distributor: "542c2e4e-7177-11ef-a9b1-0050563b", // Distribuidor
  salon:       "542c325b-7177-11ef-a9b1-0050563b", // Salon (ejemplo)
  admin:       "a3f8994a-64d3-11ef-b0bc-9828a641", // Administrador (ejemplo)
  user:        "8337416f-7177-11ef-a9b1-0050563b", // Usuario normal (tu id por defecto)
};

// sinónimos por nombre que suelen aparecer
const NAME_ALIASES: Record<RoleKey, string[]> = {
  distributor: ["distribuidor", "distributor", "Distribuidor", "Distributor"],
  salon:       ["salon", "salón", "Salon", "Salón"],
  admin:       ["administrador", "admin", "Administrador", "Admin"],
  user:        ["usuario", "user", "Usuario", "User"],
};

export function getRoleInfo(user: any) {
  if (!user) return { id: undefined as string | undefined, name: "" };

  // intenta múltiples ubicaciones comunes
  const id =
    user.roleId ||
    user.iFIdRole ||
    user.iIdRole ||
    user.role?.iIdRole;

  const nameRaw =
    user.roleName ||
    user.vctyperole ||
    user.vcrole ||
    user.role?.vctyperole;

  const name = typeof nameRaw === "string" ? nameRaw.toLowerCase().trim() : "";
  return { id, name };
}

export function isRole(
  user: any,
  role: RoleKey,
  map: RoleMap = DEFAULT_ROLE_MAP
) {
  const { id, name } = getRoleInfo(user);

  // por ID exacto (si está configurado)
  if (id && map[role] && id === map[role]) return true;

  // por nombre/alias
  if (name && NAME_ALIASES[role].some((alias) => alias === name)) return true;

  return false;
}

export const isDistributorUser = (user: any, map?: RoleMap) =>
  isRole(user, "distributor", map);

export const isSalonUser = (user: any, map?: RoleMap) =>
  isRole(user, "salon", map);

export const isAdminUser = (user: any, map?: RoleMap) =>
  isRole(user, "admin", map);

export const isNormalUser = (user: any, map?: RoleMap) =>
  isRole(user, "user", map);

