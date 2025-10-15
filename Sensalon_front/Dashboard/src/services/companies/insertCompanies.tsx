import { api } from "../../utils/axiosClients";

export const InsertCompanies = async (vcname: string, vcdescription: string, vcsocialreason: string, vcorigin: string, vcmanufacturingaddress: string, vcemail: string, vcphone: string, vcwebsite: string) => {

    let resultado = await api.post('/createcompanies', {
        vcname: vcname,
        vcdescription: vcdescription,
        vcsocialreason: vcsocialreason, 
        vcorigin: vcorigin, 
        vcmanufacturingaddress: vcmanufacturingaddress, 
        vcemail: vcemail, 
        vcphone: vcphone, 
        vcwebsite: vcwebsite, 
    })
    console.log('hol')
    return resultado.data
}