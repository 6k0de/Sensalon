import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { User } from "../../interfaces/User";

interface UserCreation extends Optional<User, 'iIdUser'> { }

export const Users = conn.define<Model<User, UserCreation>>('users', {
  iIdUser: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  iFIdRole: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vcfirstname: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: false,
},
vclastname: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: false,
},
  vcusername: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  vcpassword: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  vcemail: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  cashbackbalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
  },
  dtcreation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  dtupdate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  modelName: 'users',
  timestamps: false
});
