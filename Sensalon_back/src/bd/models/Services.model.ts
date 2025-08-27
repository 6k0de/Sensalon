
import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Service } from "../../interfaces/Services";

interface ServiceCreation extends Optional<Service, 'iIdService'> { }

export const Services = conn.define<Model<Service, ServiceCreation>>('services', {
  iIdService: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  vcservicename: {
    type: DataTypes.STRING(63),
    allowNull: true,
  },
  dtcreated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  dtupdate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  modelName: 'services',
  timestamps: false,
});
