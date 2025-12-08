export type DiscountType = 'PERCENT' | 'FIXED';
export type DiscountScope = 'GLOBAL' | 'PRODUCTS';

export interface DiscountCode {
    id?: string;
    code: string;
    description?: string | null;
    discountType: "PERCENT" | "FIXED";
    value: number;
    scope: "all" | "products";
    productIds?: string[];
    usageLimitType: "limited" | "unlimited";
    usageLimit: number | null;
    usageCount: number | null
    minSubtotal: number | null;
    isActive: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
}

export interface DiscountCodeProduct {
    id: number;
    discountCodeId: string;
    productId: string;
}


export interface DiscountCodeUsage {
    id: number;
    discountCodeId: string;
    orderId?: string | null;
    userId?: string | null;
    used_at: Date;
}
