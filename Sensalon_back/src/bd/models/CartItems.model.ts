import { DataTypes, Model, Optional } from "sequelize";
import { CartItemAttributes } from "../../interfaces/CartItems";
import conn from "../config/config";

interface CartItemsCreationAttributes extends Optional<CartItemAttributes, 'iIdCartItem'> { }

export const CartItemsModel = conn.define<Model<CartItemAttributes, CartItemsCreationAttributes>>('cartItems', {
    iIdCartItem: {
        type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    iFIdCart: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    iFIdProduct: {
        type: DataTypes.INTEGER.UNSIGNED,
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