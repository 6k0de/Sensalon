import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    XCircle,
    Mail,
    Phone,
    AlertTriangle,
} from 'lucide-react'
import { useCartStore } from '../hooks/useCartStore'

export const PaymentErrorPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const clearCart = useCartStore((s: any) => s.clearCart);
    const syncCartToBackend = useCartStore((s: any) => s.syncCartToBackend);
    // Valores que vienen del backend
    const transactionId = searchParams.get('transactionId') || searchParams.get('idTransaction') || 'N/A'
    const status = searchParams.get('status') || 'rejected'
    const errorMessage =
        searchParams.get('error') ||
        'No se pudo procesar el pago intentelo de nuevo.'
    const paymentMethod = searchParams.get('method') || 'Desconocido'
    const date = searchParams.get('date')
        ? new Date(searchParams.get('date') as string).toLocaleString('es-MX')
        : new Date().toLocaleString('es-MX')

    // Datos de contacto
    const supportEmail = 'roman.pizano@sensalon.com.mx'
    const supportPhone = '+52 33 2597 0877'

    useEffect(() => {
        clearCart()
        const cartId = localStorage.getItem("cartId")
        if (cartId) {
            syncCartToBackend(cartId)
        }
        localStorage.removeItem("cart-storage")
    }, [clearCart, syncCartToBackend])
    /*  const handleContactSupport = () => {
         window.open(
             `mailto:${supportEmail}?subject=Error en pago - ${transactionId}&body=Hola, tengo un problema con mi pago. ID de referencia: ${transactionId}`,
         )
     }
     const handleCallSupport = () => {
         window.open(`tel:${supportPhone}`)
     } */

    return (
        <div className="">

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Error en el Pago
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {paymentMethod === 'MercadoPago' ? <span>Mercado pago rechazo su pago</span> : <span>Se rechazo el pago </span>}
                    </p>
                </div>

                {/* Error Alert */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                Error de Procesamiento
                            </h3>
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                    </div>
                </div>

                {/* Error Details Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-red-600 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            Detalles del Error
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Estado
                                    </label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        ✕ {status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Fecha y Hora
                                    </label>
                                    <p className="text-lg text-gray-900">{date}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Método de Pago
                                    </label>
                                    <p className="text-lg text-gray-900">{paymentMethod}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID de Referencia
                                    </label>
                                    <p className="font-mono text-lg text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                                        {transactionId}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Código de Error
                                    </label>
                                    <p className="text-lg text-gray-900">
                                        {searchParams.get('errorCode') || 'ERR_PAYMENT_DECLINED'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opciones de soporte */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Opciones de Soporte
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => { }}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                            <Mail className="w-6 h-6 text-blue-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-600">{supportEmail}</p>
                            </div>
                        </button>
                        <button
                            onClick={() => { }}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                        >
                            <Phone className="w-6 h-6 text-green-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Teléfono</p>
                                <p className="text-sm text-gray-600">{supportPhone}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
