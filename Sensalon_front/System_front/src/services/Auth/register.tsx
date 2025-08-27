import axios from 'axios';
import { ResultServices } from '../../interfaces/resultServices';

export const RegisterServices = async ({ firstName, lastName, username, email, password }: { firstName: string, lastName: string, username: string, email: string, password: string }): Promise<ResultServices> => {
    try {
        // Realiza la solicitud y retorna directamente la data en caso de éxito
        const response = await axios.post<ResultServices>('http://localhost:3000/api/register', {
            firstName,
            lastName,
            username,
            email,
            password,
        });

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error en el servidor. Inténtalo de nuevo más tarde.');
    }
};
