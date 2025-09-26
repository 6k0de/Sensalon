import { Transaction } from "../../interfaces/transactions";

export interface TableTransactionsProps {
    encabezados: string[];
    data: Transaction[];
    fetch?: () => void;
    outofstock: string;
}
