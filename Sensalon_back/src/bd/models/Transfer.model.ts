import { DataTypes, Model, Optional } from "sequelize";
import { Transfer } from "../../interfaces/Transfer";
import conn from "../config/config";

interface TransferCreation extends Optional<Transfer, "iIdInfotransfer"> {}

export const TransferModel = conn.define<Model<Transfer, TransferCreation>>(
  "infotransfer",
  {
    iIdInfotransfer: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    bankname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountnumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interbankcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cardnumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "infotransfer",
    timestamps: false,
  },
);
