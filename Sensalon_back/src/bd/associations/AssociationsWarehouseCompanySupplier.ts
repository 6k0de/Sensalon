import { Companies } from "../models/Companies.model";
import { SupplierModel } from "../models/Suppliers.model"
import { WarehouseModel } from "../models/WarehouseEntrance.model"

export const AssociationsWarehouseCompanySupplier = () => {
    SupplierModel.hasMany(WarehouseModel, {
        foreignKey: "supplierId",
    });

    Companies.hasMany(WarehouseModel, {
        foreignKey: "companyId",
    });

    WarehouseModel.belongsTo(SupplierModel, {
        foreignKey: "supplierId",
        as: "supplier",
    });

    WarehouseModel.belongsTo(Companies, {
        foreignKey: "companyId",
        as: "company",
    });
}