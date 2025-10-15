import { DataTypes, Model, Optional } from "sequelize";
import { CashbackConf } from "../../interfaces/CashbackConf";
import conn from "../config/config";


interface CashbackConfCreationAttributes extends Optional<CashbackConf, 'iIdCashbackconfig'> { }

export const CashBackConf = conn.define<Model<CashbackConf, CashbackConfCreationAttributes>>('cashbackconfig', {
    iIdCashbackconfig: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    cashbackpercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        onUpdate: 'CURRENT_TIMESTAMP',
    }
},
    {
        modelName: 'cashbackconfig',
        tableName: 'cashbackconfig',
        timestamps: false,
    })