import { DataTypes, Model, Optional } from "sequelize";
import { CartAttributes } from "../../interfaces/Cart";
import conn from "../config/config";

interface CartCreationAttributes extends Optional<CartAttributes, 'iIdCart'> { }

export const CartModel = conn.define<Model<CartAttributes, CartCreationAttributes>>('cart', {
    iIdCart: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    iFIdUser: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    dtCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    dtUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},
    {
        tableName: 'cart',
        timestamps: false,
    })