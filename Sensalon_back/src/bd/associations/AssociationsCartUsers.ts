import { CartModel } from "../models/Cart.model";
import { Users } from "../models/Users.model";

export const AssociationsCartUsers = () => {
    Users.hasOne(CartModel, {
        foreignKey: 'iFIdUser',
        sourceKey: 'iIdUser'
    });
    CartModel.belongsTo(Users, {
        foreignKey: 'iFIdUser',
        targetKey: 'iIdUser'
    });
};
