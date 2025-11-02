import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, AlertCircle } from 'lucide-react'
export const PaymentPendingPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const transactionId =
        searchParams.get('transactionId') || searchParams.get('idTransaction') || 'N/A'
    const paymentMethod = searchParams.get('method') || 'Transferencia Bancaria'
    const estimatedTime = searchParams.get('estimatedTime') || '24 horas'

    useEffect(() => {
        localStorage.removeItem("cart-storage");
    }, []);

    return (
        <div className="">

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Clock className="w-12 h-12 text-yellow-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Pago en Proceso
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {paymentMethod === 'MercadoPago' ? <span>Tu pago se encuentra siendo procesado por Mercado Pago</span> : <span>Tu pago esta siendo procesado y revisado por nuestro equipo</span>}
                    </p>
                </div>
                {/* Status Alert */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 mb-1">
                                Procesando Pago
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Los pagos mediante mercado pago pueden tomar{' '}
                                {estimatedTime} en ser confirmados. Se te enviara un email
                                cuando el pago sea aprobado.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Payment Details Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-yellow-600 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            Detalles de la Transacción
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Estado Actual
                                    </label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        ⏱ Pendiente
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Método de Pago
                                    </label>
                                    <p className="text-lg text-gray-900">{paymentMethod}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Fecha de Solicitud
                                    </label>
                                    <p className="text-lg text-gray-900">
                                        {new Date().toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID de Transacción
                                    </label>
                                    <p className="font-mono text-lg text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                                        {transactionId}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tiempo Estimado
                                    </label>
                                    <p className="text-lg text-gray-900">{estimatedTime}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Última Actualización
                                    </label>
                                    <p className="text-sm text-gray-600">
                                        {new Date().toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Help Section */}
                <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        ¿Necesitas ayuda?
                    </h3>
                    <div className="space-y-2 text-blue-800">
                        <p>
                            • Los pagos pendientes por Mercado Pago pueden demorar hasta {estimatedTime}
                        </p>
                        <p>• Recibirás un email cuando el pago sea confirmado</p>
                        <p>
                            • Si tienes dudas, contacta nuestro soporte con el ID:{' '}
                            {transactionId}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
