import { Distributor } from "./Distributors";
import { Salon } from "./Salon";

export interface User {
    iIdUser?: string;
    iFIdRole?: string;
    vcfirstname: string;
    vclastname: string;
    vcusername: string;
    vcpassword: string;
    vcemail: string;
    cashbackbalance: number;
    dtcreation?: Date;
    dtupdate?: Date;
    salonData?: Salon;
    distributorData?: Distributor;
}