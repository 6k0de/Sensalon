export interface Product {
    iIdProduct: string;
    iFIdCompany: string;
    vcname: string;
    vcdescription: string;
    vcweight: string;
    vcquantity: string;
    vcphoto: string;
    decprice1: number;
    decprice2: number;
    decprice3: number;
    istock: number;
    istocklimit: number;
    dtcreation: Date;
    dtupdate?: Date | null;
    dtdeletion?: Date | null;
}