import { DataTypes, Model, Optional } from "sequelize";
import { ShippingAddress } from "../../interfaces/ShippingAdd";
import conn from "../config/config";

interface ShippingAddresCreation extends Optional<ShippingAddress, 'iIdAddressId'> { }


export const ShippingAddresModel = conn.define<Model<ShippingAddress, ShippingAddresCreation>>('shippingaddresses', {
    iIdAddressId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    iIFIdUser: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vccountry: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcfirstname: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },
    vclastname: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcaddress: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcsuburb: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vcinterior: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    vczipcode: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    vccity: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    vcstate: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    vcphone: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    vcadditonalindication: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },
    dtCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    modelName: 'shippingaddresses',
    timestamps: false
});
