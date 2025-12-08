import { DataTypes, Model, Optional } from "sequelize";
import { WarehouseEntrance } from "../../interfaces/Warehouseentrance";
import conn from "../config/config";


interface WarehouseEntranceAttributes extends Optional<WarehouseEntrance, 'id'> { }

export const WarehouseModel = conn.define<Model<WarehouseEntranceAttributes, WarehouseEntrance>>('warehouseentrance', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    docnumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    datebuy: {
        type: DataTypes.DATEONLY, // DATE en MySQL
        allowNull: false,
        defaultValue: DataTypes.NOW, // respeta current_timestamp
    },
    entryreason: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    productlist: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    totalcost: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    supplierId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    companyId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
},
    {
        tableName: 'warehouseentrance',
        timestamps: false,
    })