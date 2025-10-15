import { useState } from "react"
import { Companie } from "../../interfaces/companies"
import { InsertCompanies } from "../../services/companies/insertCompanies"
import { UpdateCompanies } from "../../services/companies/updateCompanies"

export const ModalCompanie = ({ show, onClose, data, mode }: { show: boolean, onClose: (message: string, type: "success" | "error" | null) => void, data: Companie | any, mode: number }) => {
  const initialValues: Companie = {
    vcname: data?.vcname ?? '',
    vcdescription: data?.vcdescription ?? '',
    vcsocialreason: data?.vcsocialreason ?? '',
    vcorigin: data?.vcorigin ?? '',
    vcmanufacturingaddress: data?.vcmanufacturingaddress ?? '',
    vcemail: data?.vcemail ?? '',
    vcphone: data?.vcphone ?? '',
    vcwebsite: data?.vcwebsite ?? '',
  }

  const [datos, setDatos] = useState(initialValues)


  const handleChange = (e: any) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmitCompanies = async (e: any) => {
    e.preventDefault()
    if (mode === 0) {
      InsertCompanies(datos.vcname, datos.vcdescription, datos.vcsocialreason, datos.vcorigin, datos.vcmanufacturingaddress, datos.vcemail, datos.vcphone, datos.vcwebsite).then((res) => {
        if (res.value != 0) {
          onClose(res.message, 'error')
        } else {
          onClose(res.message, 'success')
        }
      })
    } else {
      UpdateCompanies(data?.iIdCompany, datos.vcname, datos.vcdescription, datos.vcsocialreason, datos.vcorigin, datos.vcmanufacturingaddress, datos.vcemail, datos.vcphone, datos.vcwebsite).then((res) => {
        if (res.value != 0) {
          onClose(res.message, 'error')
        } else {
          onClose(res.message, 'success')
        }
      })
    }
  }

  
  return (
    <div id="crud-modal" aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300 ease-in-out`}>
      <div className="fixed inset-0 bg-[#1d1d1b] bg-opacity-50 transition-opacity duration-300 ease-in-out"></div>
      <div className={`relative w-full max-w-5xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 transform transition-transform ${show ? "scale-100" : "scale-95"} duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-2xl font-bold text-[#1d1d1b] dark:text-white">Nueva Empresa</h3>
          <button type="button" onClick={() => onClose('', null)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>
        <form onSubmit={handleSubmitCompanies} className="p-4 md:p-5">
          <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-11">
            <div className="col-span-2 lg:col-span-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre:</label>
              <input value={datos.vcname} onChange={handleChange} type="text" name="vcname" id="vcname" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="ESD PROFESSIONAL INC" />
            </div>
            <div className="col-span-2 lg:col-span-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción:</label>
              <input value={datos.vcdescription} onChange={handleChange} type="text" name="vcdescription" id="vcdescription" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Empresa dedicada a productos capilares..." />
            </div>
            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Razón social:</label>
              <input value={datos.vcsocialreason} onChange={handleChange} type="text" name="vcsocialreason" id="vcsocialreason" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Comercializadora GHI, S.N.C." />
            </div>

          </div>

          <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-9">
            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">País origen:</label>
              <input value={datos.vcorigin} onChange={handleChange} type="text" name="vcorigin" id="vcorigin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Brazil" />
            </div>

            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electronico:</label>
              <input value={datos.vcemail} onChange={handleChange} type="email" name="vcemail" id="vcemail" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="empresa@gmail.com" />
            </div>
            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono:</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 19 18">
                    <path d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z" />
                  </svg>
                </div>
                <input value={datos.vcphone} onChange={handleChange} type="text" id="vcphone" name="vcphone" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" pattern="[0-9]{3}[0-9]{3}[0-9]{4}" placeholder="123-456-7890" required />
              </div>
            </div>
          </div>

          <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Direccion fabricación:</label>
              <input value={datos.vcmanufacturingaddress} onChange={handleChange} type="text" name="vcmanufacturingaddress" id="vcmanufacturingaddress" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Av. Jose Lopez Portillo 37 Y 37 A Esq. Tultepeccoacalco" />
            </div>

            <div className="col-span-2 lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sitio web:</label>
              <input value={datos.vcwebsite} onChange={handleChange} type="text" name="vcwebsite" id="vcwebsite" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ejemplo: www.ejemplo.com / ejemplo.com" />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" className="flex text-white items-center bg-[#32322f] hover:bg-[#1d1d1b] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
              {mode == 1 ? 'Editar empresa' : ' Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}