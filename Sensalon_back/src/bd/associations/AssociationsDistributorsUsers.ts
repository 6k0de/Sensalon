import { Distributors } from "../models/Distributors.model"
import { Users } from "../models/Users.model"

export const AssociationsDistributorsUsers = () => {
    Distributors.belongsTo(Users, {
        foreignKey: 'iFIdUser', // Clave foránea 
        targetKey: 'iIdUser'    // Clave primaria
    });
}