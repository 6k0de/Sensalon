import { useCartStore } from "../../hooks/useCartStore";
import { useProductStore } from "../../hooks/useProductStore";
import { getUserTypeFromRoleId } from "../../interfaces/role";
import { api } from "../../utils/axiosClients";

export const LoginServices = async ({ username, password }: { username: string, password: string }) => {
    try {
        const response = await api.post(`/login`, {
            username,
            password
        });
        // Guardar en el localStorage
        const user = response.data.user ?? response.data
        console.log('esto me llega desde el backend:', user)
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(response.data)); // Aquí guardamos idUser y role
        localStorage.setItem('userType', getUserTypeFromRoleId(user.iFIdRole));
        console.log(user)
         const cartRes = await api.get(`/cart/${user.iIdUser}`); // usa tu endpoint GetIdCartByUser
        const idCart = cartRes.data.cart.iIdCart;

        // Guardamos en localStorage y store Zustand
        localStorage.setItem("cartId", idCart);
        useCartStore.getState().setCartFromBackend(user.iIdUser)
        useProductStore.getState().fetchFromCache();
        useProductStore.getState().refreshFromServer().catch(() => { });

        return { value: 0, message: 'Inicio de sesión exitoso', data: response.data }; // Retornamos los datos

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error al iniciar sesión. Intenta nuevamente.";
        return { value: 1, message: errorMessage }; // Retorna un mensaje de error
    }
};
