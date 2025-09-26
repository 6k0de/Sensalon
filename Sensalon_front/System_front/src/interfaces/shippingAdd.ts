export interface ShippingAddress {
    iIdAddressId: string;
    iIFIdUser: string;    
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

export interface ShippingAddressRequest {
  country: string;
  name: string;
  lastname: string;
  address: string;
  suburb: string;
  interior: string;
  zipcode: string;
  city: string;
  state: string;
  phone: string;
  additonal: string;
}
