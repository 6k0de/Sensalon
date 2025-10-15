import { api } from "../../utils/axiosClients";

export const LoginServices = async ({ username, password }: { username: string, password: string }) => {
    //PRODUCCION: https://api.sensalon.com.mx/
    try {
        const response = await api.post(`/loginA`, {
            username,
            password
        });
        // Guardar en el localStorage
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(response.data)); // Aquí guardamos idUser y role

        return { value: 0, message: 'Inicio de sesión exitoso', data: response.data }; // Retornamos los datos

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error al iniciar sesión. Intenta nuevamente.";
        return { value: 1, message: errorMessage }; // Retorna un mensaje de error
    }
};
