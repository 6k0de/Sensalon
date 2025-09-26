import { ShippingAddresModel } from "../models/ShippingAdd.model";
import { Users } from "../models/Users.model";

export const AssociationsShippingTransactions = () => {
    ShippingAddresModel.belongsTo(Users, {
        foreignKey: 'iIFIdUser',
        as: 'user',
        onUpdate: 'CASCADE',
    });
    Users.hasMany(ShippingAddresModel, {
        foreignKey: 'iIFIdUser',
        as: 'addresses',
    });
};
