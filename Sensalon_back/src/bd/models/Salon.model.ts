import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Salon } from "../../interfaces/Salon";

interface SalonCreation extends Optional<Salon, 'iIdsalon'> {}

export const Salons = conn.define<Model<Salon, SalonCreation>>('salons', {
    iIdsalon: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    iFIdUser: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vcsalonname: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vccellphone: {
        type: DataTypes.STRING(16),
        allowNull: true,  // Permite valores nulos según la definición
    },
    vcemail: {
        type: DataTypes.STRING(128),
        allowNull: true,
    },
    vcaddress: {
        type: DataTypes.STRING(128),
        allowNull: true,
    },
    dtopeningtime: {
        type: DataTypes.TIME,
        allowNull: true,  // Permite valores nulos
    },
    dtdeparturtime: {
        type: DataTypes.TIME,
        allowNull: true,  // Permite valores nulos
    },
    vcservices: {
        type: DataTypes.TEXT('medium'),  // Usamos TEXT para manejar JSON o grandes datos
        allowNull: true,
    },
}, {
    modelName: 'salons',
    timestamps: false,  // No usamos `createdAt` ni `updatedAt` por defecto
});