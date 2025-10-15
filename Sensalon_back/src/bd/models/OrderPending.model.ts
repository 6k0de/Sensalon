import { DataTypes, Model, Optional } from "sequelize";
import { OrderPendingAttributes } from "../../interfaces/OrderPending";
import conn from "../config/config";

interface OrderPendingCreationAttributes extends Optional<OrderPendingAttributes, 'iIdOrderPending'> {}

export const CreateOrderPending = conn.define<Model<OrderPendingAttributes, OrderPendingCreationAttributes>>("orderspending",
  {
    iIdOrderPending: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    iIdUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    iIdShippingAddress: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    cashback: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    credit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "orderspending",
    timestamps: true,
  }
);

// Relación opcional si ya tienes Users y ShippingAddresses definidos
// OrdersPending.belongsTo(Users, { foreignKey: "iIdUser" });
// OrdersPending.belongsTo(ShippingAddresses, { foreignKey: "iIdShippingAddress" });


