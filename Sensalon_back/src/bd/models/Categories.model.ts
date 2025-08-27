import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Categorie } from "../../interfaces/Categories";

interface CategoryCreation extends Optional<Categorie, 'iIdCategory'> { }

export const Categories = conn.define<Model<Categorie, CategoryCreation>>('categories', {
    iIdCategory: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    vcname: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    vcdescription: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    dtcreation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    dtupdate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        onUpdate: 'CURRENT_TIMESTAMP',
    }
},
    {
        modelName: 'categories',
        timestamps: false,
    }
)
