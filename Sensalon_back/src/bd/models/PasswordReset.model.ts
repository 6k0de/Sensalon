import { DataTypes, Model, Optional } from "sequelize";
import { PasswordReset } from "../../interfaces/PasswordReset";
import conn from "../config/config";

interface PasswordResetCreationAttributes extends Optional<PasswordReset, 'iIdToken'> { }

export const PasswordResetModel = conn.define<Model<PasswordReset, PasswordResetCreationAttributes>>("passwordresettokens",
    {
        iIdToken: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        vcemail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vctoken: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dtexpiration: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "passwordresettokens",
        timestamps: true,
    }
);