import { TableTransactionsProps } from "../../utils/props/Transactions.props"
import { Transaction } from "../../interfaces/transactions"
import { useEffect, useState } from "react"
import { formatStatus, formatValue } from "../../utils/formatters"
import { api, recipt } from "../../utils/axiosClients"
import { updateStatusTransaction } from "../../services/satusChangeTransaction/statusChange"
import { SuccessToast } from "../Toast/successToast"
import { ErrorToast } from "../Toast/errorToast"
import { Companie } from "../../interfaces/companies"
import { ModalProductsInTransactions } from "../Modals/modal.products.transaction"
import { guessTypeFromName, normalizeReceiptUrl } from "../../helpers/reciptHelper"

export const TableTransactions = ({ encabezados, data, outofstock, fetch }: TableTransactionsProps) => {
    const [selectedProducts, setSelectedProducts] = useState<any[]>([])
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewType, setPreviewType] = useState<"image" | "pdf" | "unknown">("unknown");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [companies, setCompanies] = useState<Companie[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get("/empresas")
                setCompanies(response.data)
            } catch (error) {
                console.error("Error fetching empresas:", error)
            }
        }
        fetchCompanies()
    }, [])

    const handleStatusChange = async (id: string, status: string) => {
        setIsLoading(true)
        try {
            const res = await updateStatusTransaction(id, status);
            setToastMessage(res.message || "Estado actualizado correctamente");
            setToastType("success");
            setShowToast(true);
            fetch?.()
        } catch (error: any) {
            setToastMessage(error.response?.data?.message || "Error al actualizar el estado");
            setToastType("error");
            setShowToast(true);
        } finally {
            setIsLoading(false)
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(null);
                setToastType(null);
            }, 4000);
        }
    }

    const handleViewProducts = (products: any) => {
        if (!products || products === "null") {
            setSelectedProducts([])
            setShowModal(true)
            return
        }
        console.log(products)
        let parsed
        try {
            // 1️⃣ Si viene como texto plano tipo "[{\"...\"}]" -> lo parseamos doble
            if (typeof products === "string") {
                parsed = JSON.parse(products);
                if (typeof parsed === "string") {
                    parsed = JSON.parse(parsed);
                }
            } else {
                parsed = products;
            }
        } catch (error) {
            console.error("❌ Error al parsear productos:", error);
            parsed = [];
        }

        // Soporte para estructuras antiguas
        if (!Array.isArray(parsed)) {
            parsed = parsed?.Producto
                ? [{ name: parsed.Producto, companyId: "N/A", quantity: 1, total: 0 }]
                : []
        }
        console.log(parsed)
        // Estandarizar campos clave
        parsed = parsed.map((p: any) => ({
            name: p.name || p.productName || "Producto desconocido",
            quantity: p.quantity || 1,
            priceUnit: p.priceUnit || p.price || 0,
            total: p.total || (p.priceUnit || p.price || 0) * (p.quantity || 1),
            companyId: p.companyId || p.companie || "N/A",
            image: p.image || null,
        }))

        setSelectedProducts(parsed)
        setShowModal(true)
    }


    const handleViewComprobante = async (transaction: Transaction) => {
        const raw = transaction?.urltransferrecipt;
        if (transaction?.paymentMethod === "MercadoPago") {
            alert("Esta transacción es de MercadoPago, no requiere comprobante.");
            return;
        }
        if (!raw) {
            alert("No hay comprobante disponible para esta transacción.");
            return;
        }

        try {
            // Normalizar ruta
            console.log(transaction)
            const fileName = raw.split("/").pop();
            if (!fileName) return;

            const url = normalizeReceiptUrl(recipt.defaults.baseURL!, raw);
            const kind = guessTypeFromName(url);
            // Hacemos HEAD request para obtener el tipo MIME

            if (kind === "pdf") {
                window.open(url, "_blank"); // navega ⇒ no requiere CORS
                return;
            }
            if (kind === "image") {
                // Mostrar en tu modal <img src={previewUrl} /> ⇒ no requiere CORS
                setPreviewUrl(url);
                setPreviewType("image");
                setShowPreview(true);
                return;
            }
            // Desconocido: abrir en pestaña nueva
            window.open(url, "_blank");
        } catch (err) {
            console.error("Error al cargar comprobante:", err);
            alert("No se pudo cargar el comprobante.");
        }
    };
    console.log(data)
    return (
        <>
            {isLoading && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    aria-live="polite"
                    aria-busy="true"
                    role="status"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                        <p className="text-white text-sm font-medium">Procesando…</p>
                        <span className="sr-only">Cargando</span>
                    </div>
                </div>
            )}
            <div className="fixed top-4 right-4 z-50">
                {toastMessage && toastType === "success" && <SuccessToast message={toastMessage} showToast={showToast} />}
                {toastMessage && toastType === "error" && <ErrorToast message={toastMessage} showToast={showToast} />}
            </div>
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
                                        {transaction?.user?.vcfirstname +' '+ transaction?.user?.vclastname || "N/A"}
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
                <ModalProductsInTransactions
                    setShowModal={setShowModal}
                    selectedProducts={selectedProducts}
                    companies={companies}
                />
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