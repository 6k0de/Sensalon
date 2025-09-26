export interface Salon {
  iIdRole: string;
  vctyperole: string;
  vcusername: string;
  vcfirstname: string;
  vclastname: string;
  vcemail: string;
  vcsalonname: string;
  vcservices: string | null;
  service_names_array: string[] | null;
  vcaddress: string;
  vccellphone: string;
  email_salon: string;
  dtopeningtime: Date;  // formato "HH:mm:ss"
  dtdeparturtime: Date; // formato "HH:mm:ss"
  vclogo: string | null;
  dtCreated: Date;      // formato ISO date
}
