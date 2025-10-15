import { DistributorData } from "./distributionData";
import { SalonData } from "./salonData";

export interface formData {
  iIdUser?: string;
  iFIdUser?: string;
  iIdRole?: string;
  role: string;
  nombres: string;
  apellidos: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  distributorData?: DistributorData;
  salonData?: SalonData;
}
