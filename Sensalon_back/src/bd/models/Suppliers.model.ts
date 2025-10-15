import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Supplier } from "../../interfaces/Suppliers";

interface SuppliersCreation extends Optional<Supplier, 'iIdSuppliers'> { }

export const SupplierModel = conn.define<Model<Supplier, SuppliersCreation>>('suppliers', {
    iIdSuppliers: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
        primaryKey: true,
    },
    vcsupplier: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    vcrfc: {
        type: DataTypes.STRING(13),
        allowNull: true,
    },
    vcrazonsocial: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    vcphone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    vcemail: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    dtcreation: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'suppliers',
    timestamps: false,
})
