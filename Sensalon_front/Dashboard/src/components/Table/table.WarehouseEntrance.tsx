import { useState } from "react";
import { FaPenToSquare } from "react-icons/fa6";
import './table.css';
import { Spinner } from "../Spinner/spinner";
import { WarehouseEntrance } from "../../interfaces/warehouse";
import { formatDate } from "../../utils/formatters";

export const TableWarehouse = ({ encabezados, data, fetch, outofstock, handleEdit }: { encabezados: string[], data: WarehouseEntrance[] | any, fetch: { (): void } | null, outofstock: string | '', handleEdit: (warehouse: WarehouseEntrance) => void }) => {

    const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner

    return (
        <>

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
                            data?.map((warehouse: WarehouseEntrance, index: number) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {formatDate(warehouse.datebuy)}
                                    </td>
                                    <td className="px-6 py-2">
                                        {warehouse.docnumber}
                                    </td>
                                    <td className="px-6 py-2">
                                        {warehouse.supplierName}
                                    </td>
                                    <td className="px-6 py-2">
                                        {warehouse.companyName}
                                    </td>
                                    <td className="px-6 py-2">
                                        {warehouse.totalamount}
                                    </td>
                                    <td className="px-6 py-2">
                                        {warehouse.entryreason}
                                    </td>
                                    <td className="flex gap-3 px-6 py-4 text-left">
                                        <button onClick={() => handleEdit(warehouse)} className="font-medium text-[#393936] dark:text-blue-500 hover:underline">
                                            <FaPenToSquare color="blue" size={18} />
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
