
import { Companies } from '../models/Companies.model';
import { Products } from '../models/Products.model';

export const AssociationsProductsCompanies = () => {
  Companies.hasMany(Products, {
    foreignKey: 'iFIdCompany',
    as: 'products',  
  });

  // Relación de un producto pertenece a una empresa
  Products.belongsTo(Companies, {
    foreignKey: 'iFIdCompany',
    as: 'company',  
  });
}