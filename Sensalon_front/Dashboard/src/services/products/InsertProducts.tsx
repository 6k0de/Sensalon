import { api } from "../../utils/axiosClients";

export const InsertProducts = async (formData: FormData) => {

    let resultado = await api.post('/createproducto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    console.log('hol')
    return resultado.data
}