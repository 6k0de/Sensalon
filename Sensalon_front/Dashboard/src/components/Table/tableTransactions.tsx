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
    const [selectedMeta, setSelectedMeta] = useState<any | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [companies, setCompanies] = useState<Companie[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [proofList, setProofList] = useState<string[]>([]);
    const [pdfList, setPdfList] = useState<string[]>([]);
    const [proofIndex, setProofIndex] = useState(0);

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
            setSelectedProducts([]);
            setSelectedMeta(null);
            setShowModal(true);
            return;
        }

        console.log("raw products:", products);
        let parsed: any = products;

        try {
            // 1️⃣ Si viene como string -> parsear (soporta doble JSON.stringify)
            if (typeof products === "string") {
                parsed = JSON.parse(products);
                if (typeof parsed === "string") {
                    parsed = JSON.parse(parsed);
                }
            }
        } catch (error) {
            console.error("❌ Error al parsear productos:", error);
            parsed = null;
        }

        let meta: any = null;
        let rawItems: any[] = [];

        // 2️⃣ Caso NUEVO: { items: [...], meta: {...} }
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.items)) {
            rawItems = parsed.items;
            meta = parsed.meta || null;
        }
        // 3️⃣ Caso anterior: ya es un array de productos
        else if (Array.isArray(parsed)) {
            rawItems = parsed;
        }
        // 4️⃣ Caso MUY viejo: { Producto: "..." }
        else if (parsed?.Producto) {
            rawItems = [
                {
                    name: parsed.Producto,
                    quantity: 1,
                    total: 0,
                    companyId: "N/A",
                    priceUnit: 0,
                },
            ];
        } else {
            rawItems = [];
        }

        console.log("rawItems:", rawItems);
        console.log("meta:", meta);

        // 5️⃣ Estandarizar los campos clave para el modal
        const normalized = rawItems.map((p: any) => ({
            name: p.name || p.productName || "Producto desconocido",
            quantity: p.quantity || 1,
            priceUnit: p.priceUnit || p.price || 0,
            total: p.total || (p.priceUnit || p.price || 0) * (p.quantity || 1),
            companyId: p.companyId || p.companie || "N/A",
            image: p.image || null,
            // por si luego quieres usarlo
            iIdProduct: p.iIdProduct || p.productId || null,
            categoryIds: p.categoryIds || [],
        }));

        setSelectedProducts(normalized);
        setSelectedMeta(meta);
        setShowModal(true);
    };



    const handleViewComprobante = async (transaction: Transaction) => {
        const raw = transaction?.urltransferrecipt;
        console.log(raw)
        if (transaction?.paymentMethod === "MercadoPago") {
            alert("Esta transacción es de MercadoPago, no requiere comprobante.");
            return;
        }
        if (!raw) {
            alert("No hay comprobante disponible para esta transacción.");
            return;
        }

        try {
            const normalizeList = (input: any): string[] => {
                if (!input) return [];
                if (Array.isArray(input)) return input.filter(Boolean);
                if (typeof input === "string") {
                    try {
                        const parsed = JSON.parse(input);
                        if (Array.isArray(parsed)) return parsed.filter(Boolean);
                        if (typeof parsed === "string") return parsed.split(",").map(s => s.trim()).filter(Boolean);
                    } catch {
                        return input.split(",").map(s => s.trim()).filter(Boolean);
                    }
                }
                return [];
            };

            const rawList = normalizeList(raw);
            if (rawList.length === 0) {
                alert("No hay comprobante disponible para esta transacción.");
                return;
            }
            const urls = rawList.map((r) => normalizeReceiptUrl(recipt.defaults.baseURL!, r));
            const images = urls.filter((u) => guessTypeFromName(u) === "image");
            const pdfs = urls.filter((u) => guessTypeFromName(u) === "pdf");

            console.log({urls, images, pdfs})
            if (images.length === 0 && pdfs.length === 1) {
                window.open(pdfs[0], "_blank");
                return;
            }

            setProofList(images);
            setPdfList(pdfs);
            setProofIndex(0);
            setPreviewUrl(images.length > 0 ? images[0] : "");
            setShowPreview(true);
        } catch (err) {
            console.error("Error al cargar comprobante:", err);
            alert("No se pudo cargar el comprobante.");
        }
    };

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
                                        {transaction?.user?.vcfirstname + ' ' + transaction?.user?.vclastname || "N/A"}
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
                    meta={selectedMeta}
                />
            )}

            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Comprobantes</h3>
                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    setProofList([]);
                                    setPdfList([]);
                                    setProofIndex(0);
                                }}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ✖
                            </button>
                        </div>

                        {proofList.length > 0 && (
                            <div className="relative flex flex-col items-center gap-3">
                                <img
                                    src={proofList[proofIndex]}
                                    alt={`Comprobante ${proofIndex + 1}`}
                                    className="max-h-[60vh] mx-auto rounded-lg shadow object-contain"
                                />
                                <div className="flex items-center justify-between w-full">
                                    <button
                                        className="px-3 py-1 rounded border text-sm"
                                        onClick={() =>
                                            setProofIndex((prev) =>
                                                prev === 0 ? proofList.length - 1 : prev - 1
                                            )
                                        }
                                        disabled={proofList.length <= 1}
                                    >
                                        ◀ Anterior
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {proofIndex + 1} / {proofList.length}
                                    </span>
                                    <button
                                        className="px-3 py-1 rounded border text-sm"
                                        onClick={() =>
                                            setProofIndex((prev) =>
                                                prev === proofList.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        disabled={proofList.length <= 1}
                                    >
                                        Siguiente ▶
                                    </button>
                                </div>
                            </div>
                        )}

                        {pdfList.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold">Comprobantes PDF</h4>
                                {pdfList.map((url, idx) => (
                                    <a
                                        key={url + idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-blue-600 hover:underline text-sm"
                                    >
                                        Ver PDF {idx + 1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    )
}
