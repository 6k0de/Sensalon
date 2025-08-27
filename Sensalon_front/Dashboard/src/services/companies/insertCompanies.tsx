import axios from "axios";

export const InsertCompanies = async (vcname: string, vcdescription: string, vcsocialreason: string, vcorigin: string, vcmanufacturingaddress: string, vcemail: string, vcphone: string, vcwebsite: string) => {

    let resultado = await axios.post('http://localhost:3000/api/createcompanies', {
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