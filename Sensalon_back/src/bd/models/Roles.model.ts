import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Role } from "../../interfaces/Roles";

interface RolesCreation extends Optional<Role, 'iIdRole'> {}

export const Roles = conn.define<Model<Role, RolesCreation>>('roles',{
  iIdRole: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  vctyperole: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  vcdescription: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  dtcreation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  dtupdate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dtdeletion: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
    modelName: 'roles',
    timestamps: false
});
