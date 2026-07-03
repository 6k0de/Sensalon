import axios from 'axios'
import { create } from 'zustand'
import { CategorieStore } from '../interfaces/categorieStore'

export const useCategorieStore = create<CategorieStore>((set) => ({
    categories: [],
    fetchCategories: async () => {
        try {
            const resp = await axios.get('http://localhost:3000/api/categorias')
            set({ categories: resp.data })
        } catch (error) {   
            console.error('Error al cargar las categorias', error)
        }
    }
}))