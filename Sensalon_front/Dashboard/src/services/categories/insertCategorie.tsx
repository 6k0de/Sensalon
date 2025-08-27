import axios from "axios";

export const InsertCategorie = async (name: string, descripcion: string) => {

    let resultado = await axios.post('http://localhost:3000/api/createcategorie', {
        vcname: name,
        vcdescription: descripcion
    })
    console.log('hol')
    return resultado.data
}