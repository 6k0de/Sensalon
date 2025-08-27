import { DataTypes, Model, Optional } from "sequelize";
import conn from "../config/config";
import { Product } from "../../interfaces/Product";

interface ProductCreation extends Optional<Product, 'iIdProduct'> { }

export const Products = conn.define<Model<Product, ProductCreation>>('products', {
    iIdProduct: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    iFIdCompany: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vccategories: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    vcname: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcdescription: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcweight: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcquantity: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcphoto: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },
    decprice1: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    decprice2: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    decprice3: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    istock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    istocklimit: {
        type: DataTypes.INTEGER,
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
    },
},
    {
        modelName: 'products',
        timestamps: false,
    }
)