import { normalizeImageUrl } from "../../helpers/normalizeUrl";
import { Companie } from "../../interfaces/companies";

export const ModalProductsInTransactions = ({ setShowModal, selectedProducts, companies, meta }: { setShowModal: (show: boolean) => void, selectedProducts: any[], companies: Companie[], meta?: any | null; }) => {
    // 🔹 Subtotales basados en productos, como respaldo
    const itemsSubtotal = Number(meta?.rawSubtotal)

    // 🔹 Tomar valores desde meta si existen, si no usar fallback
    const subtotalAfterDiscount =
        meta?.subtotalAfterDiscount ??
        meta?.subtotalParsed ??
        itemsSubtotal;

    const discount = meta?.discount ?? 0;
    const discountCode = meta?.discountCode || null;
    const shipping = meta?.shipping ?? 0;
    const cashback = meta?.cashback ?? 0;
    const credit = meta?.credit ?? 0;

    const flags = meta?.flags || {};
    const usedCredit = Boolean(flags.addCredit);
    const usedCashback = Boolean(flags.useCashback);

    const total =
        meta?.total ??
        (subtotalAfterDiscount + shipping - cashback + credit);

    return (
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
                                    (
                                        selectedProducts[0]?.iFIdCompany ||
                                        selectedProducts[0]?.companyId === "N/A"
                                    ) &&
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
                                                                            src={normalizeImageUrl(p.image)}
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
                                        {/* Total general */}
                                        <div className="text-right border-t pt-3 space-y-1">
                                            <p className="text-gray-800 font-semibold">
                                                Total general (solo suma de productos): ${totalGeneral.toFixed(2)}
                                            </p>

                                            {/* 🧾 Resumen detallado si hay meta */}
                                            {meta && (
                                                <div className="mt-3 inline-block text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                                                    <p>
                                                        <span className="font-medium">Subtotal (items): </span>
                                                        ${Number(itemsSubtotal).toFixed(2)}
                                                    </p>

                                                    {discount > 0 && (
                                                        <p>
                                                            <span className="font-medium">Descuento:</span>{" "}
                                                            -${discount.toFixed(2)}{" "}
                                                            {discountCode && (
                                                                <span className="text-xs text-gray-500">
                                                                    (código: {discountCode})
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}

                                                    <p>
                                                        <span className="font-medium">Subtotal después de descuento:</span>{" "}
                                                        ${subtotalAfterDiscount.toFixed(2)}
                                                    </p>

                                                    {shipping > 0 && (
                                                        <p>
                                                            <span className="font-medium">Envío:</span>{" "}
                                                            ${shipping.toFixed(2)}
                                                        </p>
                                                    )}

                                                    {cashback > 0 && (
                                                        <p>
                                                            <span className="font-medium">Cashback aplicado:</span>{" "}
                                                            -${cashback.toFixed(2)}{" "}
                                                            {usedCashback && (
                                                                <span className="text-xs text-green-600">
                                                                    (se descontó del saldo del cliente)
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}

                                                    {credit > 0 && (
                                                        <p>
                                                            <span className="font-medium">Crédito aplicado:</span>{" "}
                                                            +${credit.toFixed(2)}{" "}
                                                            {usedCredit && (
                                                                <span className="text-xs text-blue-600">
                                                                    (se registró crédito en la cuenta)
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-base">
                                                        <span className="font-semibold">Total final:</span>{" "}
                                                        <span className="font-bold text-blue-700">
                                                            ${total.toFixed(2)}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
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
    )
}