import axios from "axios";

export const InsertProducts = async (formData: FormData) => {

    let resultado = await axios.post('http://localhost:3000/api/createproducto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    console.log('hol')
    return resultado.data
}