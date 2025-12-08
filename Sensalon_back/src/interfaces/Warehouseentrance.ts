export interface WarehouseEntrance {
    id?: number;
    docnumber: number;
    datebuy: Date;
    entryreason: string;
    productlist: string;
    totalcost: number;
    supplierId: string;
    companyId: string;
}