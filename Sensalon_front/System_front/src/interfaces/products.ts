export interface Product {
    iIdProduct: string;
    iFIdCompany: string;
    iIdCompany?: string;
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
    vccategories?: string;
    company?: {
        vcname: string
    };
    producttype: any;
    relatedproductId: string;
    variantcolor: string;
    variantlabel?: string;
    childrenVariants?: Product[];
    // Compatibilidad con otros componentes
    type?: any;
    variants?: any[];
    bundleItems?: any[];
    bundlePrice?: number;
}
