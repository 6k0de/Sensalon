import { Products } from '../models/Products.model';
import { Categories } from '../models/Categories.model';

export const AssociationsProductsCategories = () => {
    // Relación de muchos a muchos entre productos y categorías
    Products.belongsToMany(Categories, {
        through: 'relproductscategories',  // Puedes usar este nombre como referencia para la tabla en el SP
        foreignKey: 'iFIdProduct',
        as: 'categories'
    });

    Categories.belongsToMany(Products, {
        through: 'relproductscategories',  // Nombre usado en el SP
        foreignKey: 'iFIdCategory',
        as: 'products'
    });
};
