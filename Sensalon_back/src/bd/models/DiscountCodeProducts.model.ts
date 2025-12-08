import { DataTypes, Model, Optional } from "sequelize";
import { DiscountCodeProduct } from "../../interfaces/Discount";
import conn from "../config/config";


interface DiscountCodeProductsAttributes extends Optional<DiscountCodeProduct, 'id'> { }

export const DiscountCodeProductsModel = conn.define<Model<DiscountCodeProduct, DiscountCodeProductsAttributes>>('discountcodeproducts', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    discountCodeId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
},
    {
        tableName: 'discountcodeproducts',
        timestamps: false,
    }
)