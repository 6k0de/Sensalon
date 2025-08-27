import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Distributor } from "../../interfaces/Distributors";

interface DistributorsCreation extends Optional<Distributor, 'iIdDistributor'> { }

export const Distributors = conn.define<Model<Distributor, DistributorsCreation>>('	distributors', {
    iIdDistributor: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4, // Usar UUID para generar un valor por defecto
      },
      iFIdUser: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      vccompanies: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      vcaddress: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcstate: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vccity: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vcpostalcode: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vccountry: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vcphone: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vcemail: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      vcrfc: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      vcconsfis: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      dtcreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dtupdate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
}, {
    modelName: 'distributors', 
    timestamps: false
})
