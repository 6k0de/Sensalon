import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Companie } from "../../interfaces/Companie";

interface CompaniesCreation extends Optional<Companie, 'iIdCompany'>{}

export const Companies = conn.define<Model<Companie, CompaniesCreation>>('companies',{
    iIdCompany: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vcname: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcdescription: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcsocialreason: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcorigin: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcmanufacturingaddress: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcemail: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vcphone: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      vcwebsite: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      dtcreation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    modelName: 'companies',
    timestamps: false
})