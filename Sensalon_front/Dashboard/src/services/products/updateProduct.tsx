import { api } from "../../utils/axiosClients";

export const UpdateProduct = async (formData: FormData) => {
    
    let resultado = await api.post('/actualizarproducto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    console.log('hol')
    return resultado.data
}



