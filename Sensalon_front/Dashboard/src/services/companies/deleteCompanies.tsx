import axios from "axios";

export const DeleteCompanies = async (id: string) => {
    try {
        console.log('categoria a borrar: ', id);
        const resultado = await axios.post(`http://localhost:3000/api/deletecompanies/${id}`);
        return resultado.data;
    } catch (error) {
        console.error('Error eliminando la categoria: ', error);
        throw error; 
    }
};
