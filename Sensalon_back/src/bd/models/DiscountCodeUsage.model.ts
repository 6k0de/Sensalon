import { DataTypes, Model, Optional } from "sequelize";
import { DiscountCodeUsage } from "../../interfaces/Discount";
import conn from "../config/config";

interface DiscountCodeUsageAttributes extends Optional<DiscountCodeUsage, 'id'> { }

export const DiscountCodeUsageModel = conn.define<Model<DiscountCodeUsage, DiscountCodeUsageAttributes>>('discountcodeusages', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    discountCodeId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
    {
        tableName: 'discountcodeusages',
        timestamps: false,
    }
)