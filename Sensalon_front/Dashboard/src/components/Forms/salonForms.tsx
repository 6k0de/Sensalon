import { useState, useEffect, useRef } from "react"
import { Service } from "../../interfaces/services"
import axios from "axios"
import { FaChevronDown } from "react-icons/fa6"
import { formData } from "../../interfaces/formData"

export const SalonForms = ({ formData, setFormData }: { formData: formData, setFormData: React.Dispatch<React.SetStateAction<formData>> }) => {
    const [services, setServices] = useState<Service[]>([])
    const [showDropdownServices, setShowDropdownServices] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [, setSelectedFile] = useState<File | null>(null); // Estado para el archivo de imagen
    const dropdownRefServices = useRef<HTMLDivElement>(null);

    const SalonData = formData.salonData || {};

    useEffect(() => {
        axios.get('http://localhost:3000/api/services').then((res) => {
            setServices(res.data)
        })
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRefServices.current && !dropdownRefServices.current.contains(event.target as Node)) {
                setShowDropdownServices(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleServiceChange = (serviceId: string) => {
        const servicios = SalonData.serviciosOfrecidos ? JSON.parse(SalonData.serviciosOfrecidos).Services : [];

        // Si el servicio ya está seleccionado, lo eliminamos
        if (servicios.some((service: { idService: string }) => service.idService === serviceId)) {
            const updatedServices = servicios.filter((service: { idService: string }) => service.idService !== serviceId);
            updateSalonServices(updatedServices);
        } else {
            // Si no está seleccionado, lo agregamos
            const updatedServices = [...servicios, { idService: serviceId }];
            updateSalonServices(updatedServices);
        }
    };

    const updateSalonServices = (updatedServices: any) => {
        const serviciosJSON = JSON.stringify({
            Services: updatedServices,
        });
        setFormData((prevFormData) => ({
            ...prevFormData,
            salonData: {
                ...prevFormData.salonData,
                serviciosOfrecidos: serviciosJSON,
            },
        }));
    };

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);  // Guardar el archivo en el estado
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string); // Previsualización local de la nueva imagen seleccionada
            reader.readAsDataURL(file);
    
            // Actualiza el estado del formData con el archivo seleccionado
            setFormData((prevFormData) => ({
                ...prevFormData,
                salonData: {
                    ...prevFormData.salonData,
                    logoSalon: file, // Guarda el archivo en formData
                },
            }));
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            salonData: {
                ...prevFormData.salonData,
                [name]: value,
            },
        }));
    };

    return (
        <>
            <form>
                <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="col-span-2 lg:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre del salón:</label>
                        <input type="text" name="nombreSalon" id="nombreSalon" value={SalonData.nombreSalon || ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Francisco Javier" />
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono:</label>
                        <input type="text" name="telefono" id="telefono" value={SalonData.telefono || ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Francisco Javier" />
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electronico:</label>
                        <input type="text" name="correo" id="correo" value={SalonData.correo || ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Arriaga Montero" />
                    </div>
                </div>

                <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="col-span-2 lg:col-span-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Direccion Completa(calle, numero, ciuidad, estado, codigo postal, etc.)</label>
                        <input type="text" name="direccion" id="direccion" value={SalonData.direccion || ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Francisco Javier" />
                    </div>
                </div>

                <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="col-span-2 lg:col-span-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hora de apertura:</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 11-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="time"
                                    name="horaApertura"
                                    id="horaApertura"
                                    value={formData.salonData?.horaApertura || '09:00'}
                                    onChange={handleInputChange}
                                    min="07:00"
                                    max="23:59"
                                    required
                                    className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hora de cierre:</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 11-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="time"
                                name="horaCierre"
                                id="horaCierre"
                                value={formData.salonData?.horaCierre || '12:00'}
                                onChange={handleInputChange}
                                min="07:00"
                                max="23:59"
                                required
                                className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                        </div>
                    </div>
                    <div className="col-span-2 lg:col-span-2" ref={dropdownRefServices}>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Servicios ofrecidos:</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowDropdownServices(!showDropdownServices)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 flex justify-between items-center"
                            >
                                <p className="text-start">
                                    {SalonData?.serviciosOfrecidos && JSON?.parse(SalonData?.serviciosOfrecidos).Services?.length > 0
                                        ? JSON?.parse(SalonData?.serviciosOfrecidos).Services
                                            .map((serviceObj: { idService: string }) => services.find(s => s.iIdService === serviceObj.idService)?.vcservicename)
                                            .join(', ')
                                        : "Seleccione los servicios"}
                                </p>
                                <FaChevronDown className="text-[#6B7280]" />
                            </button>

                            {showDropdownServices && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                                    <ul className="p-2 max-h-48 overflow-y-auto">
                                        {services.length === 0 ? (
                                            <li>No hay servicios disponibles</li>
                                        ) : (
                                            services.map(service => (
                                                <li key={service.iIdService} className="flex items-center px-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={service.iIdService}
                                                        value={service.iIdService}
                                                        checked={SalonData.serviciosOfrecidos ? JSON.parse(SalonData.serviciosOfrecidos).Services.some((s: { idService: string }) => s.idService === service.iIdService) : false}
                                                        onChange={() => handleServiceChange(service.iIdService)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={service.iIdService} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                                        {service.vcservicename}
                                                    </label>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-span-2 lg:col-span-3">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Logo de la empresa:</label>
                        <input type="file" onChange={handleImageChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400 focus:outline-none" accept="image/*" />
                        {imagePreview && <img src={imagePreview} alt="Imagen del producto" className="mt-1 mb-2 w-full rounded-xl max-h-48 object-cover" />}
                    </div>
                </div>
            </form>
        </>
    )
}