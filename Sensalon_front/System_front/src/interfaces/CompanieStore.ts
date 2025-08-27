import { Companie } from "./empresas";

export interface CompanieStore {
    companies: Companie[]
    fetchCompanies: () => Promise<void>
}