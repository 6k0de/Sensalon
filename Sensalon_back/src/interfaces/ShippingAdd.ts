export interface ShippingAddress {
    iIdAddressId: string; // UUID
    iIFIdUser: string;    // UUID
    vccountry: string;
    vcfirstname: string;
    vclastname: string;
    vcaddress: string;
    vcsuburb: string;
    vcinterior: string;
    vczipcode: string;
    vccity: string;
    vcstate: string;
    vcphone: string;
    vcadditonalindication: string;
    dtCreated?: Date;
}
