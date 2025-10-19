import { DataTypes, Model, Optional } from "sequelize";
import { InventoryReservation } from "../../interfaces/InventoryReservation";
import conn from "../config/config";

interface InventoryReservationAttributes extends Optional<InventoryReservation, 'iIdInventoryReservation'> { }

export const InventoryReservationModel = conn.define<Model<InventoryReservationAttributes, InventoryReservation>>("inventoryreservations",
  {
    iIdInventoryReservation: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("reserved", "committed", "released"),
      defaultValue: "reserved",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "inventoryreservations",
    timestamps: false,
  }
);