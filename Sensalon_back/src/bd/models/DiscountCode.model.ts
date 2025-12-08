import { DataTypes, Model, Optional, UUIDV4 } from "sequelize";
import { DiscountCode } from "../../interfaces/Discount";
import conn from "../config/config";


interface DiscountCodeAttributes extends Optional<DiscountCode, 'id'> { }

export const DiscountCodeModel = conn.define<Model<DiscountCode, DiscountCodeAttributes>>('discountcodes', {
   
    id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      discountType: {
        type: DataTypes.ENUM("PERCENT", "FIXED"),
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scope: {
        type: DataTypes.ENUM("all", "products"),
        allowNull: false,
        defaultValue: "all",
      },
      usageLimitType: {
        type: DataTypes.ENUM("limited", "unlimited"),
        allowNull: false,
        defaultValue: "limited",
      },
      usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      usageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      minSubtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "startdate",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "enddate",
      },
    },
    {
        tableName: 'discountcodes',
        timestamps: true,
    })
