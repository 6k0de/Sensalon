import { TransactionModel } from "../models/Transaction.model";
import { Users } from "../models/Users.model";

export const AssociationsUserTransactions = () => {
    TransactionModel.belongsTo(Users, {
        foreignKey: 'iuserId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    Users.hasMany(TransactionModel, {
        foreignKey: 'iuserId',
        as: 'transactions',
    });
};
