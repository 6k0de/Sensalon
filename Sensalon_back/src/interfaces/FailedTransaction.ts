export interface FailedTransaction {
  ordernum?: string;
  amount?: number | string;
  idUser?: string;
  errorMessage: string;
  errorStack?: string;
  [key: string]: any;
}