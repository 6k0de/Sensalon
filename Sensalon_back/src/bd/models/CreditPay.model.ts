import { DataTypes, Model, Optional } from "sequelize";
import { CreditPay } from "../../interfaces/CreditPay";
import conn from "../config/config";


interface CreditPayCreation extends Optional<CreditPay, 'iIdPay'> { }

export const CreditPays = conn.define<Model<CreditPay, CreditPayCreation>>('paycredits', {
    iIdPay: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    iFIdCredit: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    paymount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    datepay: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    paymentmethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    referencpay: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    modelName: 'paycredits',
    tableName: 'paycredits',
    timestamps: false
})
