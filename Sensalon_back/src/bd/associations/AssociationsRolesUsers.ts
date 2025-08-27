import { Users } from '../models/Users.model';
import { Roles } from '../models/Roles.model';

export const AssociationsRolesUsers = () => {
    Users.belongsTo(Roles, {
        foreignKey: 'iFIdRole',
        targetKey: 'iIdRole',
        as: 'roles'
    });

    Roles.hasMany(Users, {
        foreignKey: 'iFIdRole',
        sourceKey: 'iIdRole',
        as: 'users'
    });
};

