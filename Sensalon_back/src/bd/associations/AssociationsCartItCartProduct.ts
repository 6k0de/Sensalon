import { CartModel } from "../models/Cart.model";
import { CartItemsModel } from "../models/CartItems.model";
import { Products } from "../models/Products.model";

export const AssociationsCartItCartProduct = () => {
    CartModel.hasMany(CartItemsModel, {
        foreignKey: 'iFIdCart',
        sourceKey: 'iIdCart', // La clave primaria en la tabla Cart
    });
    CartItemsModel.belongsTo(CartModel, {
        foreignKey: 'iFIdCart',
        targetKey: 'iIdCart',
    });
    // Product -> CartItem (Uno a muchos)
    Products.hasMany(CartItemsModel, {
        foreignKey: 'iFIdProduct',
        sourceKey: 'iIdProduct', // La clave primaria en la tabla Product
    });
    // Asociación entre CartItem y Products
    CartItemsModel.belongsTo(Products, {
        foreignKey: "iFIdProduct",
        targetKey: "iIdProduct",
        as: "product", // Alias definido aquí
    });
};
