import axios from "axios";

export const deleteProduct = async (id: string) => {
    try {
        console.log('producto a borrar: ', id);
        const resultado = await axios.post(`http://localhost:3000/api/deleteproduct/${id}`);
        return resultado.data;
    } catch (error) {
        console.error('Error eliminando el producto: ', error);
        throw error; // Manejar el error en la llamada que invoque este servicio
    }
};
