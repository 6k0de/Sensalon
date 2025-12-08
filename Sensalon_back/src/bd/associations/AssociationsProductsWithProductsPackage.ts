import { Products } from "../models/Products.model";
import { ProductPakcageItemsModel } from "../models/ProductsPackageitemst.model";

export const AssociationsProductsWithProductsPackage = () => {
    Products.hasMany(ProductPakcageItemsModel, {
        as: 'packageItems',
        foreignKey: 'packageId',
        sourceKey: 'iIdProduct',
    });

    ProductPakcageItemsModel.belongsTo(Products, {
        as: 'itemProduct',          // el producto hijo dentro del paquete
        foreignKey: 'productId',
        targetKey: 'iIdProduct',
    });
}