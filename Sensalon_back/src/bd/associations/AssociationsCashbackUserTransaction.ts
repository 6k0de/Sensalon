import { CashBack } from "../models/Cashback.model";
import { TransactionModel } from "../models/Transaction.model";
import { Users } from "../models/Users.model";

export const AssociationsCashbackUserTransaction = () => {
    CashBack.belongsTo(Users, {
        foreignKey: 'FiIdUser',
        as: 'user'
    });
    CashBack.belongsTo(TransactionModel, {
        foreignKey: 'FiIdTransaction',
        as: 'transaction'
    });
    Users.hasMany(CashBack, {
        foreignKey: 'FiIdUser',
        as: 'cashbacks'
    });
    TransactionModel.hasMany(CashBack, {
        foreignKey: 'FiIdTransaction',
        as: 'cashbacks'
    });
}