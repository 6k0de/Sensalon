import React, { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle, Copy} from "lucide-react"

export const PaymentSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams()

    // Recuperar parámetros enviados por el backend
    const transactionId = searchParams.get("orderNumber") || "N/A"
    const amount = searchParams.get("amount")
        ? `$${Number(searchParams.get("amount")).toFixed(2)}`
        : "N/A"
    const paymentMethod = searchParams.get("method") || "Mercado Pago"
    const date = searchParams.get("date")
        ? new Date(searchParams.get("date") as string).toLocaleString("es-MX")
        : new Date().toLocaleString("es-MX")

    const handleCopyId = () => {
        navigator.clipboard.writeText(transactionId)
        alert("ID copiado al portapapeles")
    }

   useEffect(() => {
       localStorage.removeItem("cart-storage");
     }, []);

    return (
        <div className="bg">

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        ¡Pago Completado!
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tu transacción ha sido procesada exitosamente. Recibirás un email de
                        confirmación en breve.
                    </p>
                </div>

                {/* Card Detalles */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-green-600 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            Detalles de la Transacción
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Monto Pagado
                                    </label>
                                    <p className="text-2xl font-bold text-gray-900">{amount}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Método de Pago
                                    </label>
                                    <p className="text-lg text-gray-900">{paymentMethod}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Fecha y Hora
                                    </label>
                                    <p className="text-lg text-gray-900">{date}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID de Transacción
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-lg text-gray-900 bg-gray-100 px-3 py-2 rounded-lg flex-1">
                                            {transactionId}
                                        </p>
                                        <button
                                            onClick={handleCopyId}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copiar ID"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Estado
                                    </label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        ✓ Completado
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
