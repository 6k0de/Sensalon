import { DataTypes, Model, Optional } from "sequelize";
import { Transaction } from "../../interfaces/Transaction";
import conn from "../config/config";

interface TransactionCreation extends Optional<Transaction, 'iIdTransaction'> { }
export const TransactionModel = conn.define<Model<Transaction, TransactionCreation>>("transactions", {
    iIdTransaction: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    mercadoPagoPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    iuserId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    iOrderPendingId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ishippingAddressId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    merchantOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    products: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    urltransferrecipt: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    cashbackapplied: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    modelName: 'transactions',
    tableName: 'transactions',
    timestamps: false
});
