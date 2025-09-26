import { FaEye } from "react-icons/fa6"
import { TableTransactionsProps } from "../../utils/props/Transactions.props"
import { Transaction } from "../../interfaces/transactions"
import { useState } from "react"
import { formatStatus, formatValue } from "../../utils/formatters"
import { recipt } from "../../utils/axiosClients"

export const TableTransactions = ({ encabezados, data, outofstock }: TableTransactionsProps) => {
    const [selectedProducts, setSelectedProducts] = useState<any[]>([])
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewType, setPreviewType] = useState<"image" | "pdf" | "unknown">("unknown");

    const [showModal, setShowModal] = useState<boolean>(false)

    const handleStatusChange = (id: string, status: string) => {
        console.log({ id, status })
    }

    const handleViewProducts = (products: any) => {
        if (!products || products === "null") {
            // Si no hay productos válidos
            setSelectedProducts([]);
            setShowModal(true);
            return;
        }

        let parsed;
        try {
            parsed = typeof products === "string" ? JSON.parse(products) : products;
        } catch (error) {
            console.error("Error al parsear productos:", error);
            parsed = [];
        }

        if (Array.isArray(parsed)) {
            // Caso de IDs crudos ["id1","id2"]
            if (parsed.length > 0 && typeof parsed[0] === "string") {
                parsed = parsed.map((id: string) => ({
                    name: "Producto desconocido",
                    companie: id,
                    quantity: 1,
                }));
            }
        } else {
            // No es array, mostramos vacío
            parsed = [];
        }

        setSelectedProducts(parsed);
        setShowModal(true);
    };

    const handleViewComprobante = async (transaction: Transaction) => {
        if (transaction?.paymentMethod === "MercadoPago") {
            alert("Esta transacción es de MercadoPago, no requiere comprobante.");
            return;
        }

        if (!transaction?.urltransferrecipt) {
            alert("No hay comprobante disponible para esta transacción.");
            return;
        }

        try {
            // Normalizar ruta
            const fileName = transaction?.urltransferrecipt.split("/").pop();
            if (!fileName) return;

            // Hacemos HEAD request para obtener el tipo MIME
            const resp = await recipt.head(`/${fileName}`);
            const contentType = resp.headers["content-type"];

            if (contentType.startsWith("image/")) {
                setPreviewUrl(`${recipt.defaults.baseURL}/${fileName}`);
                setPreviewType("image");
                setShowPreview(true);
            } else if (contentType === "application/pdf") {
                window.open(`${recipt.defaults.baseURL}/${fileName}`, "_blank");
            } else {
                alert("Formato no soportado, abriendo en pestaña nueva.");
                window.open(`${recipt.defaults.baseURL}/${fileName}`, "_blank");
            }
        } catch (err) {
            console.error("Error al cargar comprobante:", err);
            alert("No se pudo cargar el comprobante.");
        }
    };
    console.log(data)
    return (
        <>
            <div className="relative shadow-md sm:rounded-lg custom-scrollbar max-h-[580px] overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-[#393936] bg-[#f7f7f6] sticky top-0 z-10">
                        <tr>
                            {encabezados.map((header, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10"
                                >
                                    <div className="flex items-center">{header}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data?.map((transaction: Transaction, index: number) => (
                                <tr
                                    key={index}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.iIdTransaction || "N/A"}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {formatValue(transaction.mercadoPagoPaymentId)}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.paymentMethod === "MercadoPago" ? (
                                            <span
                                                className={`px-3 py-1 rounded-lg text-sm font-medium ${transaction.status === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : transaction.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {formatStatus(transaction.status, transaction.paymentMethod).text}
                                            </span>
                                        ) : (
                                            <select
                                                value={transaction.status}
                                                onChange={(e) =>
                                                    handleStatusChange(transaction.iIdTransaction, e.target.value)
                                                }
                                                className="w-40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
        focus:ring-blue-500 focus:border-blue-500 block p-2.5 
        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
        dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            >
                                                <option value="error">Error</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.amount || "N/A"}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.iuserId || "N/A"}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.merchantOrderId || "N/A"}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.paymentMethod || "N/A"}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.products && transaction.products !== "null" ? (
                                            <button
                                                onClick={() => handleViewProducts(transaction.products)}
                                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                            >
                                                Ver productos
                                            </button>
                                        ) : (
                                            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-lg">
                                                Productos no disponibles
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "N/A"}
                                    </td>

                                    <td className="flex gap-3 px-6 py-4 text-left">
                                        {transaction.paymentMethod === "MercadoPago" ? (
                                            <span className="text-xs text-gray-500 italic">Sin comprobante</span>
                                        ) : (
                                            <button
                                                onClick={() => handleViewComprobante(transaction)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 
                 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
                                            >
                                              
                                                Ver comprobante
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={encabezados.length + 1}
                                    className="text-center py-4 text-lg "
                                >
                                    {outofstock}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md p-4">
                        {/* Contenedor del modal */}
                        <div className="relative bg-white rounded-lg shadow-lg dark:bg-gray-800">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-700 border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Productos comprados
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Cerrar modal</span>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                {selectedProducts?.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedProducts.map((p, i) => (
                                            <li key={i} className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {p.name || "Producto desconocido"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID compañía: {p.companie}
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                    x{p.quantity || 1}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-red-500">
                                        ⚠ No hay productos disponibles en esta transacción. Puede tratarse de un error en el proceso de pago.
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPreview && previewType === "image" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Vista previa del comprobante</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ✖
                            </button>
                        </div>
                        <img
                            src={previewUrl}
                            alt="Comprobante de transferencia"
                            className="max-h-[70vh] mx-auto rounded-lg shadow"
                        />
                    </div>
                </div>
            )}

        </>
    )
}