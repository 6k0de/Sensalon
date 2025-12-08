export interface WarehouseEntrance {
    id?: number;
    docnumber: number;
    datebuy: Date;
    entryreason: string;
    productlist: string;
    totalamount: number;
    supplierId: string;
    companyId: string;
    companyName?: string;
    supplierName?: string;
}