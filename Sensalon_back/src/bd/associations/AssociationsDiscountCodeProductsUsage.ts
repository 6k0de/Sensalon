import { DiscountCodeModel } from "../models/DiscountCode.model";
import { DiscountCodeProductsModel } from "../models/DiscountCodeProducts.model";
import { DiscountCodeUsageModel } from "../models/DiscountCodeUsage.model";

export const AssociationsDiscountCodeProductsUsage = () => {
    // DiscountCode 1 - N DiscountCodeProduct
    DiscountCodeModel.hasMany(DiscountCodeProductsModel, {
        foreignKey: 'discountCodeId',
        as: 'products',
    });

    DiscountCodeProductsModel.belongsTo(DiscountCodeModel, {
        foreignKey: 'discountCodeId',
        as: 'discountCode',
    });

    // DiscountCode 1 - N DiscountCodeUsage
    DiscountCodeModel.hasMany(DiscountCodeUsageModel, {
        foreignKey: 'discountCodeId',
        as: 'usages',
    });

    DiscountCodeUsageModel.belongsTo(DiscountCodeModel, {
        foreignKey: 'discountCodeId',
        as: 'discountCode',
    });

}