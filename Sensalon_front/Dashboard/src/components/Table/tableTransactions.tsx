import { TableTransactionsProps } from "../../utils/props/Transactions.props"
import { Transaction } from "../../interfaces/transactions"
import { useEffect, useState } from "react"
import { formatStatus, formatValue } from "../../utils/formatters"
import { api, recipt } from "../../utils/axiosClients"
import { updateStatusTransaction } from "../../services/satusChangeTransaction/statusChange"
import { SuccessToast } from "../Toast/successToast"
import { ErrorToast } from "../Toast/errorToast"
import { Companie } from "../../interfaces/companies"

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
        console.log(products)
        if (!products || products === "null") {
            setSelectedProducts([])
            setShowModal(true)
            return
        }

        let parsed
        try {
            parsed = typeof products === "string" ? JSON.parse(products) : products
        } catch (error) {
            console.error("Error al parsear productos:", error)
            parsed = []
        }

        // Soporte para estructuras antiguas
        if (!Array.isArray(parsed)) {
            parsed = parsed?.Producto
                ? [{ name: parsed.Producto, companyId: "N/A", quantity: 1, total: 0 }]
                : []
        }

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
                    <div className="relative w-full max-w-4xl p-4">
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

                            {/* Body con scroll */}
                            <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {selectedProducts.length > 0 ? (
                                    (() => {
                                        // Detectar si es transacción de crédito u otro tipo sin productos válidos
                                        const isCreditPayment =
                                            selectedProducts.length === 1 &&
                                            selectedProducts[0]?.companyId === "N/A" &&
                                            selectedProducts[0]?.total === 0;

                                        if (isCreditPayment) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                                        <span className="text-blue-600 text-2xl font-bold">💳</span>
                                                    </div>
                                                    <p className="text-gray-700 font-medium text-base">
                                                        Esta transacción corresponde a un pago de crédito.
                                                    </p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        No se registraron productos físicos asociados.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        // Agrupar productos por compañía
                                        console.log(selectedProducts)
                                        const grouped = selectedProducts.reduce((acc: any, p: any) => {
                                            const cid = p.companyId || "N/A";
                                            if (!acc[cid]) acc[cid] = [];
                                            acc[cid].push(p);
                                            return acc;
                                        }, {});

                                        // Buscar nombre de la compañía
                                        const getCompanyName = (id: string) => {
                                            const found = companies.find((c) => c.iIdCompany === id);
                                            return found ? found.vcname : "Compañía desconocida";
                                        };

                                        // Total general
                                        const totalGeneral = selectedProducts.reduce(
                                            (acc, p) => acc + (p.total || 0),
                                            0
                                        );

                                        return (
                                            <div className="space-y-6">
                                                {Object.entries(grouped).map(([companyId, items]: any) => {
                                                    const subtotal = items.reduce(
                                                        (a: number, b: any) => a + b.total,
                                                        0
                                                    );
                                                    const companyName = getCompanyName(companyId);

                                                    return (
                                                        <div
                                                            key={companyId}
                                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                                        >
                                                            {/* Encabezado de compañía */}
                                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                                <h4 className="text-gray-800 font-semibold text-sm">
                                                                    {companyName}{" "}
                                                                    <span className="text-gray-500 text-xs">
                                                                        ({items.length} producto
                                                                        {items.length > 1 ? "s" : ""})
                                                                    </span>
                                                                </h4>
                                                            </div>

                                                            {/* Lista de productos */}
                                                            <ul className="divide-y divide-gray-200">
                                                                {items.map((p: any, i: number) => (
                                                                    <li
                                                                        key={i}
                                                                        className="flex items-center justify-between p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {p.image ? (
                                                                                <img
                                                                                    src={p.image}
                                                                                    alt={p.name}
                                                                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                                                    IMG
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">
                                                                                    {p.name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    Cantidad: {p.quantity}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    Precio unitario: $
                                                                                    {p.priceUnit?.toFixed(2) || "0.00"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-sm font-bold text-blue-700">
                                                                            ${p.total?.toFixed(2) || "0.00"}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>

                                                            {/* Subtotal */}
                                                            <div className="bg-gray-50 text-right px-4 py-2 border-t border-gray-200 text-sm text-gray-700">
                                                                Subtotal:{" "}
                                                                <span className="font-semibold text-gray-900">
                                                                    ${subtotal.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Total general */}
                                                <div className="text-right border-t pt-3">
                                                    <p className="text-gray-800 font-semibold">
                                                        Total general: ${totalGeneral.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-sm text-red-500">
                                        ⚠ No hay productos disponibles en esta transacción. Puede
                                        tratarse de un error en el proceso de pago.
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