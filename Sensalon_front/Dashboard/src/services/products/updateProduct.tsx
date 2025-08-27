import axios from "axios";

export const UpdateProduct = async (formData: FormData) => {
    
    let resultado = await axios.post('http://localhost:3000/api/actualizarproducto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    console.log('hol')
    return resultado.data
}



