import { DataTypes, Model, Optional } from "sequelize";
import { Credits } from "../../interfaces/Credits";
import conn from "../config/config";

interface CreditsCreation extends Optional<Credits, 'iIdCredits'>{}

export const Credit = conn.define<Model<Credits, CreditsCreation>>('credits',{
    iIdCredits: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      iFIdUser: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      totalamount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      totalpayamount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      payamount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      state: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dtcreation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      dtUpdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
}, {
    modelName: 'credits',
    tableName: 'credits',
    timestamps: false
})