import { api } from "../../utils/axiosClients";

// Guardar/actualizar carrito
export const saveCartItems = async (idCart: string, items: any[]) => {
    try {
        const res = await api.post("/cart/items", { idCart, items });
        return res.data;
    } catch (err: any) {
        console.error("Error guardando carrito:", err.response?.data || err.message);
        throw err;
    }
};

// Obtener el carrito por usuario
export const getCartByUser = async (idUser: string) => {
    try {
        const res = await api.get(`/cart/${idUser}`);
        return res.data.cart;
    } catch (err: any) {
        console.error("Error obteniendo carrito:", err.response?.data || err.message);
        throw err;
    }
};

// Obtener los items del carrito de un usuario
export const getCartItemsByUser = async (idUser: string) => {
    try {
        const res = await api.get(`/cart/${idUser}/items`);
        return res.data.cartItems;
    } catch (err: any) {
        console.error("Error obteniendo items:", err.response?.data || err.message);
        throw err;
    }
};
