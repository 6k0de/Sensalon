import { DataTypes, Model, Optional } from "sequelize";
import { Cashback } from "../../interfaces/Cashback";
import conn from "../config/config";


interface CashbackCreation extends Optional<Cashback, 'iIdCashback'> { }

export const CashBack = conn.define<Model<Cashback, CashbackCreation>>('cashback', {
    iIdCashback: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    FiIdUser: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    FiIdTransaction: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    cashbackamount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
}, {
    modelName: 'cashback',
    tableName: 'cashback',
    timestamps: false,
})