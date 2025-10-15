import { api } from "../../utils/axiosClients";

export const InsertCategorie = async (name: string, descripcion: string) => {
    let resultado = await api.post('/createcategorie', {
        vcname: name,
        vcdescription: descripcion
    })
    return resultado.data
}