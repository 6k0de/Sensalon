import { Credit } from "../models/Credits.model";
import { Users } from "../models/Users.model";

export const AssociationsCreditUser = () => {
    Users.hasMany(Credit, {
        foreignKey: 'iFIdUser',
        as: 'credits',
        onDelete: 'CASCADE',
    });
    Credit.belongsTo(Users, {
        foreignKey: 'iFIdUser',
        as: 'user',
        onDelete: 'CASCADE',
    });
}