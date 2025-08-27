import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Role } from '../../interfaces/roles';
import { DistributorsForms } from '../Forms/distributorsForms';
import { SalonForms } from '../Forms/salonForms';
import { formData } from '../../interfaces/formData';
import { InsertUsers } from '../../services/users/insertUsers';

export const ModalUsers = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
    const [formData, setFormData] = useState<formData>({
        role: '',
        nombres: '',
        apellidos: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        salonData: {
            nombreSalon: '',
            telefono: '',
            correo: '',
            direccion: '',
            horaApertura: '',
            horaCierre: '',
            serviciosOfrecidos: '',
            logoSalon: ''
        },
        distributorData: {
            nombres: '',
            apellidos: '',
            telefono: '',
            correo: '',
            pais: '',
            estado: '',
            ciudad: '',
            codigoPostal: '',
            direccion: '',
            rfc: '',
            constanciaFiscal: undefined,
        },
    });
    const [roles, setRoles] = useState<Role[]>([])
    const [RolesError, setRolesError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changeRol, setChangeRol] = useState<string>('Usuario')

    useEffect(() => {
        axios.get('http://localhost:3000/api/roles').then((res) => {
            setRoles(res.data)
        }).catch((error) => {
            setRolesError("Error al obtener empresas: " + error.message);
        })
    }, [])
    const passwordsMatch = formData.password === formData.confirmPassword;

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.options[e.target.selectedIndex].getAttribute('data-rol-name') || '';
        console.log(selectedName);
        setChangeRol(selectedName);

        // Limpiar datos de roles no seleccionados
        setFormData((prevFormData) => {
            let newFormData = {
                ...prevFormData,
                role: selectedName,
            };
            // Si se selecciona Distribuidor, eliminar los datos de Salón
            if (selectedName === 'Distribuidor') {
                newFormData = {
                    ...newFormData,
                    distributorData: prevFormData.distributorData || {
                        nombres: '',
                        apellidos: '',
                        telefono: '',
                        correo: '',
                        pais: '',
                        estado: '',
                        ciudad: '',
                        codigoPostal: '',
                        direccion: '',
                        rfc: '',
                        constanciaFiscal: undefined,
                    },
                    salonData: undefined, // Eliminar salonData
                };
            }

            // Si se selecciona Salón, eliminar los datos de Distribuidor
            if (selectedName === 'Salón') {
                newFormData = {
                    ...newFormData,
                    salonData: prevFormData.salonData || {
                        nombreSalon: '',
                        telefono: '',
                        correo: '',
                        direccion: '',
                        horaApertura: '09:00',
                        horaCierre: '18:30',
                        serviciosOfrecidos: '',
                        logoSalon: ''
                    },
                    distributorData: undefined, // Eliminar distributorData
                };
            }
            return newFormData;
        });
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!passwordsMatch) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const formDataSend = new FormData()

        formDataSend.append('role', formData.role);
        formDataSend.append('nombres', formData.nombres);
        formDataSend.append('apellidos', formData.apellidos);
        formDataSend.append('username', formData.username);
        formDataSend.append('password', formData.password);
        formDataSend.append('email', formData.email);

        if (formData.role === 'Salón') {
            formDataSend.append('salonData[nombreSalon]', formData.salonData?.nombreSalon || '');
            formDataSend.append('salonData[telefono]', formData.salonData?.telefono || '');
            formDataSend.append('salonData[correo]', formData.salonData?.correo || '');
            formDataSend.append('salonData[direccion]', formData.salonData?.direccion || '');
            formDataSend.append('salonData[horaApertura]', formData.salonData?.horaApertura || '');
            formDataSend.append('salonData[horaCierre]', formData.salonData?.horaCierre || '');
            formDataSend.append('salonData[serviciosOfrecidos]', formData.salonData?.serviciosOfrecidos || '');
            if (formData.salonData?.logoSalon) {
                formDataSend.append('logoSalon', formData.salonData.logoSalon);
            }
        }

        if (formData.role === 'Distribuidor') {
            formDataSend.append('distributorData[telefono]', formData.distributorData?.telefono || '');
            formDataSend.append('distributorData[correo]', formData.distributorData?.correo || '');
            formDataSend.append('distributorData[pais]', formData.distributorData?.pais || '');
            formDataSend.append('distributorData[estado]', formData.distributorData?.estado || '');
            formDataSend.append('distributorData[ciudad]', formData.distributorData?.ciudad || '');
            formDataSend.append('distributorData[codigoPostal]', formData.distributorData?.codigoPostal || '');
            formDataSend.append('distributorData[direccion]', formData.distributorData?.direccion || '');
            formDataSend.append('distributorData[rfc]', formData.distributorData?.rfc || '');
            formDataSend.append('distributorData[empresasRelacionadas]', formData.distributorData?.empresasRelacionadas || '')
            if (formData.distributorData?.constanciaFiscal) {
                formDataSend.append('constanciaFiscal', formData.distributorData.constanciaFiscal);
            }
        }

        console.log(formDataSend)
        InsertUsers(formDataSend).then((res) => {
            console.log(res)
        })
    };

    return (
        <div id="crud-modal" aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300 ease-in-out`}>
            <div className="fixed inset-0 bg-[#1d1d1b] bg-opacity-50 transition-opacity duration-300 ease-in-out"></div>
            <div className={`relative w-full max-w-5xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 transform transition-transform ${show ? "scale-100" : "scale-95"} duration-300 ease-in-out`}>
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-2xl font-bold text-[#1d1d1b] dark:text-white">Crear Nuevo {changeRol}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Cerrar modal</span>
                    </button>
                </div>
                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-9">
                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Roles:</label>
                            <select id="category" onChange={handleSelect} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option value='Usuario' selected>Seleccione el rol</option>
                                {RolesError ?
                                    <>
                                        <option>Error al obtener los roles</option>
                                    </>
                                    :
                                    roles?.map((rol) => (
                                        <>
                                            <option key={rol.iIdRole} value={rol.iIdRole} data-rol-name={rol.vctyperole}>{rol.vctyperole}</option>
                                        </>
                                    ))}
                            </select>
                        </div>
                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombres:</label>
                            <input type="text" name="nombres" id="nombres" value={formData.nombres} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Francisco Javier" />
                        </div>
                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apellidos:</label>
                            <input type="text" name="apellidos" id="apellidos" value={formData.apellidos} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Arriaga Montero" />
                        </div>
                    </div>

                    <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre de usuario:</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="fjarriaga" />
                        </div>

                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña:</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="•••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-500 dark:text-gray-400"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Validar contraseña:</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="•••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-500 dark:text-gray-400"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            {!passwordsMatch && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    Las contraseñas no coinciden.
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 lg:col-span-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electronico:</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="farriaga@gmail.com" />
                        </div>
                    </div>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    {
                        changeRol === 'Distribuidor' ? <DistributorsForms data={[]} formData={formData} setFormData={setFormData} /> : changeRol === 'Salón' ? <SalonForms formData={formData} setFormData={setFormData} /> : <></>
                    }


                    <div className="flex justify-end mt-4">
                        <button type="submit" className="flex text-white items-center mt-5 bg-[#32322f] hover:bg-[#1d1d1b] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                            Crear {changeRol}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    )
}