export type DiscountScope = "all" | "products";
export type UsageLimitType = "limited" | "unlimited";
export type DiscountType = "PERCENT" | "FIXED";

export interface DiscountCode {
  id?: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  scope: DiscountScope;
  productIds?: string[];
  usageLimitType: UsageLimitType;
  usageLimit: number | null;
  usageCount: number | null;
  minSubtotal?: number | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}
