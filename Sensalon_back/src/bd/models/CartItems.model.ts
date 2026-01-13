import { DataTypes, Model, Optional } from "sequelize";
import { CartItemAttributes } from "../../interfaces/CartItems";
import conn from "../config/config";

interface CartItemsCreationAttributes extends Optional<CartItemAttributes, 'idCartItem'> { }

export const CartItemsModel = conn.define<Model<CartItemAttributes, CartItemsCreationAttributes>>('cartItems', {
    idCartItem: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    iFIdCart: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    iFIdProduct: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    iquantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    decprice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
},
    {
        tableName: 'cartItems',
        timestamps: false,
    })
