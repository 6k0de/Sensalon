import { DataTypes, Model, Optional } from "sequelize";
import { ProductsPackageItems } from "../../interfaces/ProductPackageItems";
import conn from "../config/config";


interface ProductPackageCreation extends Optional<ProductsPackageItems, 'id'> { }

export const ProductPakcageItemsModel = conn.define<Model<ProductsPackageItems, ProductPackageCreation>>('productpackageitems', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    packageId: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    productId: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    modelName: 'productpackageitems',
    timestamps: false
})

