export interface Product {
    iIdProduct: string;
    iFIdCompany: string;
    vccategories: string;
    vcname: string;
    vcdescription: string
    producttype: any,
    relatedproductId: string,
    variantcolor: string,
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

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}