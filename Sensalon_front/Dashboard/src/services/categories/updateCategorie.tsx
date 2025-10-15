import { api } from "../../utils/axiosClients";

export const UpdateCategorie = async (name: string, descripcion: string, id: string) => {
    
    let resultado = await api.post('/actualizarcategoria', {
        vcname: name,
        vcdescription: descripcion,
        iIdCategory: id
    })
    return resultado.data
}



