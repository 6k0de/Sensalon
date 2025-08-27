import axios from "axios";

export const UpdateCategorie = async (name: string, descripcion: string, id: string) => {
    
    let resultado = await axios.post('http://localhost:3000/api/actualizarcategoria', {
        vcname: name,
        vcdescription: descripcion,
        iIdCategory: id
    })
    console.log('hol')
    return resultado.data
}



