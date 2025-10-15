import { CreditPays } from "../models/CreditPay.model";
import { Credit } from "../models/Credits.model";

export const AssociationsCreditPayCredit = () => {
    Credit.hasMany(CreditPays, {
        foreignKey: 'iFIdCredit',
        as: 'CreditPays'
    });
    CreditPays.belongsTo(Credit, {
        foreignKey: 'iFIdCredit',
        as: 'Credit'
    });
}