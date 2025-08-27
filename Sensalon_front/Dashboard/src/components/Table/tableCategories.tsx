import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import './table.css';
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { Categorie } from "../../interfaces/categories";
import { DeleteCategorie } from "../../services/categories/deleteCategorie";

export const TableCategories = ({ encabezados, data, fetch, outofstock, handleEdit }: { encabezados: string[], data: Categorie[] | any , fetch: {() : void} | null, outofstock: string | '', setShowModal: any, showModal: any, handleEdit: (product: Categorie) => void }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner
    
    const handleDeleteCategorie = async (id: string) => {
        setIsProcessing(true);
        try {
            const resultado = await DeleteCategorie(id);
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
            setToastMessage('Fallo al eliminar la categoria');
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
    };

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
                            data?.map((categorie: Categorie, index: number) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {categorie.vcname}
                                    </td>
                                    <td className="px-6 py-2">
                                        {categorie.vcdescription}
                                    </td>
                                   
                                    <td className="px-6 py-2">
                                        {new Date(categorie.dtcreation).toLocaleDateString()}
                                    </td>
                                    <td className="flex gap-3 px-6 py-4 text-left">
                                        <button onClick={() => handleEdit(categorie)} className="font-medium text-[#393936] dark:text-blue-500 hover:underline">
                                            <FaPenToSquare size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteCategorie(categorie.iIdCategory)} className="font-medium text-red-600 dark:text-blue-500 hover:underline">
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
