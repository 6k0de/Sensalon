import axios from "axios";

export const InsertUsers = async (formData: FormData) => {
    console.log(formData)
    let resultado = await axios.post('http://localhost:3000/api/createuser', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
    console.log('hol')
    return resultado.data
}