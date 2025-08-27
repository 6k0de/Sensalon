import { Categorie } from "./categorias";

export interface CategorieStore {
    categories: Categorie[]
    fetchCategories: () => Promise<void> 
}