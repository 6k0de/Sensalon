import axios from 'axios'
import { create } from 'zustand'
import { ProductStore } from '../interfaces/productStore'

const getStoredProducts = () => {
    const storeData = localStorage.getItem('user')
    if(storeData){
        const userData = JSON.parse(storeData)
        return userData.products || []
    }

    return []
}

export const useProductStore = create<ProductStore>((set) => ({
    products: getStoredProducts(),
    fetchProducts: async () => {
        try {
            const storedProducts = getStoredProducts();
            if (storedProducts.length > 0) {
                set({ products: storedProducts }); 
            } else {
                const resp = await axios.get('https://api.sensalon.com.mx/api/productos');
                set({ products: resp.data });
                const user = localStorage.getItem('user');
                if (user) {
                    const userData = JSON.parse(user);
                    userData.products = resp.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }
}))
