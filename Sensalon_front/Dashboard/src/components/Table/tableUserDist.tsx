import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import './table.css';
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { Distributor } from "../../interfaces/distributors";

export const TableUserDist = ({ encabezados, data, fetch, outofstock, handleEdit }: { encabezados: string[], data: Distributor[] | any, fetch: { (): void } | null, outofstock: string | '', setShowModal: any, showModal: any, handleEdit: (dist: Distributor) => void }) => {
    const [toastMessage,] = useState<string | null>(null);
    const [toastType, ] = useState<"success" | "error" | null>(null);
    const [showToast, ] = useState(true);
    const [isProcessing, ] = useState(false); // Estado para el spinner

    /*  const handleDeleteCompanie = async (id: string) => {
         setIsProcessing(true);
         try {
             const resultado = await DeleteCompanies(id);
             if (resultado.valor == 0) {
                 setToastMessage(resultado.message);
                 setToastType('success');
                 setShowToast(true)
                 fetch!() 
             } else {
                 setToastMessage(resultado.message);
                 setToastType('error');
                 setShowToast(true)
             }
         } catch (error) {
             setToastMessage('Fallo al eliminar la empresa');
             setToastType('error');
             setShowToast(true)
         } finally {
             setIsProcessing(false);
         }
 
         // Limpiar el toast después de unos segundos
         setTimeout(() => {
             setToastMessage(null);
             setToastType(null);
             setShowToast(false)
         }, 3000); // 3 segundos
     }; */

     console.log(fetch)
     console.log(handleEdit)
    return (
        <>
            {/* Mostrar toasts si hay un mensaje */}
            <div className="fixed top-4 right-4 z-50">
                {toastMessage && toastType === "success" && <SuccessToast message={toastMessage} showToast={showToast} />}
                {toastMessage && toastType === "error" && <ErrorToast message={toastMessage} showToast={showToast} />}
            </div>

            {isProcessing && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Spinner />
                </div>
            )}

            <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg h-auto custom-scrollbar">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-[#393936] bg-[#f7f7f6] sticky top-0 z-10">
                        <tr>
                            {encabezados.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10">
                                    <div className="flex items-center">
                                        {header}
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ?
                            data?.map((userDistribiutor: Distributor | any, index: number) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.companies_names_array && JSON.parse(userDistribiutor.companies_names_array).length > 0 && !JSON.parse(userDistribiutor.companies_names_array).includes(null)
                                            ? JSON.parse(userDistribiutor.companies_names_array).join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcaddress || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcstate || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vccity || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vczipcode || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vccountry || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcphone || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcemail || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcrfc || 'N/A'}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {userDistribiutor.vcconstfisc && userDistribiutor.vcconstfisc.includes('/assets/archivos/') ? (
                                            <button
                                                onClick={() => {
                                                    // Extraemos solo el nombre del archivo desde la ruta
                                                    const normalizedPath = userDistribiutor.vcconstfisc.split('/assets/archivos/')[1];
                                                    const url = `http://localhost:3000/api/archivos/${normalizedPath}`;

                                                    // Descargar el archivo
                                                    window.open(url, '_blank'); // Abre la descarga en una nueva pestaña
                                                }}
                                                className="text-blue-500 underline"
                                            >
                                                Descargar constancia
                                            </button>
                                        ) : (
                                            <span>Pendiente</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {new Date(userDistribiutor.dtcreation).toLocaleDateString() || 'N/A'}
                                    </td>
                                    <td className="flex gap-3 px-6 py-4 text-left">
                                        <button onClick={() => { }} className="font-medium text-[#393936] dark:text-blue-500 hover:underline">
                                            <FaPenToSquare size={18} />
                                        </button>
                                        <button onClick={() => { }} className="font-medium text-red-600 dark:text-blue-500 hover:underline">
                                            <FaRegTrashCan size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={encabezados.length + 1} className="text-center py-4 text-lg ">
                                        {outofstock}
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>

            </div>

        </>
    );
};
