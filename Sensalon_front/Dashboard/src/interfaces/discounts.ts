export type DiscountScope = "all" | "products";

export type UsageLimitType = "limited" | "unlimited";

export type DiscountType = 'PERCENT' | 'FIXED';

export interface DiscountCode {
  id: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  code: string;

  discountType: DiscountType;    // porcentaje o fijo
  value: number;                 // si es PERCENT = %, si es FIXED = monto

  scope: DiscountScope;          // all = general, products = productos específicos
  productIds: string[];          // solo si scope = 'products'

  usageLimitType: UsageLimitType;
  usageLimit: number | null;

  minSubtotal?: number | null;   // monto mínimo para aplicar (opcional)

  isActive: boolean;

  usageCount: number;
  createdAt: string;
}
