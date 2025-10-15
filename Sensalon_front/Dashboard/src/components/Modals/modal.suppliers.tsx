import { useState } from "react"
import { Supplier } from "../../interfaces/suppliers"
import { createSupplier } from "../../services/suppliers/createSuppliers";
import { editSupplier } from "../../services/suppliers/editSuppliers";

export const ModalSuppliers = ({ show, onClose, data, mode }: { show: boolean, onClose: (message: string, type: "success" | "error" | null) => void, data: Supplier | any, mode: number }) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [formData, setFormData] = useState<Supplier>({
        vcsupplier: data?.vcsupplier || '',
        vcrfc: data?.vcrfc || '',
        vcrazonsocial: data?.vcrazonsocial || '',
        vcphone: data?.vcphone || '',
        vcemail: data?.vcemail || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlesubmit = (e: any) => {
        e.preventDefault()
        const newErrors: { [key: string]: string } = {}

        if (!formData.vcsupplier.trim()) {
            newErrors.vcsupplier = "El nombre del proveedor es obligatorio"
        }
        if (!formData.vcphone.trim()) {
            newErrors.vcphone = "El teléfono es obligatorio"
        } else if (!/^\d{10,15}$/.test(formData.vcphone)) {
            newErrors.vcphone = "El teléfono debe tener entre 10 y 15 dígitos numéricos"
        }

        if (formData?.vcrfc?.trim() && !/^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3})$/.test(formData.vcrfc)) {
            newErrors.vcrfc = "El RFC no tiene un formato válido"
        }

        // Email formato (si lo escribe)
        if (formData?.vcemail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.vcemail)) {
            newErrors.vcemail = "El formato del correo electrónico no es válido ejemplo@dominio.comx"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        // si no hay errores, limpiar
        setErrors({})

        if (mode === 0) {
            createSupplier(formData).then(() => {
                onClose('Proveedor creado exitosamente', 'success')
            }).catch(() => {
                onClose('Error al crear el proveedor', 'error')
            })
        } else {
            editSupplier(data.iIdSuppliers, formData).then(() => {
                onClose('Proveedor actualizado exitosamente', 'success')
            }).catch((error) => {
                onClose('Error al actualizar el proveedor', error)
            })
        }
    }

    return (
        <div id="crud-modal" aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300 ease-in-out`}>
            <div className="fixed inset-0 bg-[rgb(29,29,27)] bg-opacity-50 transition-opacity duration-300 ease-in-out"></div>
            <div className={`relative w-full max-w-xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 transform transition-transform ${show ? "scale-100" : "scale-95"} duration-300 ease-in-out`}>
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-2xl font-bold text-[#1d1d1b] dark:text-white">{mode == 0 ? 'Nuevo Proveedor' : 'Actualizando Proveedor'}</h3>
                    <button type="button" onClick={() => onClose('', null)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Cerrar modal</span>
                    </button>
                </div>

                <form onSubmit={handlesubmit} className="p-4 md:p-5">
                    <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="col-span-1 lg:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proveedor:</label>
                            <input required value={formData.vcsupplier} onChange={handleChange} type="text" name="vcsupplier" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Productos Belleza" />
                            {errors.vcsupplier && <p className="text-red-500 text-sm">{errors.vcsupplier}</p>}
                        </div>
                        <div className="col-span-1 lg:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">RFC:</label>
                            <input value={formData?.vcrfc || ''} onChange={handleChange} type="text" name="vcrfc" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="ABC123456789" />
                            {errors.vcrfc && <p className="text-red-500 text-sm">{errors.vcrfc}</p>}
                        </div>
                        <div className="col-span-1 lg:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Razón Social:</label>
                            <input value={formData?.vcrazonsocial || ''} onChange={handleChange} type="text" name="vcrazonsocial" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Cosmetic SA DE CV" />
                        </div>
                    </div>

                    <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="col-span-1 lg:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono:</label>
                            <input required value={formData.vcphone} onChange={handleChange} type="phone" name="vcphone" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="8112345698" />
                            {errors.vcphone && <p className="text-red-500 text-sm">{errors.vcphone}</p>}
                        </div>
                        <div className="col-span-1 lg:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electronico:</label>
                            <input value={formData?.vcemail || ''} onChange={handleChange} type="email" name="vcemail" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="ejemplo@ejemplo.com" />
                            {errors.vcemail && <p className="text-red-500 text-sm">{errors.vcemail}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button onClick={handlesubmit} type="submit" className="flex text-white items-center bg-[#32322f] hover:bg-[#1d1d1b] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                            {mode == 1 ? 'Editar Categoria' : ' Crear Categoria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}