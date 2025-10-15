import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, RefreshCw, Home, ExternalLink, AlertCircle } from 'lucide-react'
export const PaymentPendingPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const transactionId =
        searchParams.get('transactionId') || 'MP-2024-PENDING-456'
    const paymentMethod = searchParams.get('method') || 'Transferencia Bancaria'
    const estimatedTime = searchParams.get('estimatedTime') || '24-48 horas'
    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Simulate API call
        setTimeout(() => {
            setIsRefreshing(false)
            alert('Estado actualizado - El pago sigue pendiente')
        }, 2000)
    }
    const handleViewDetails = () => {
        alert('Redirigiendo a detalles de la transacción...')
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Pago Pendiente
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Inicio
                        </button>
                    </div>
                </div>
            </header>
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
                        Tu pago está siendo procesado. Te notificaremos cuando sea
                        confirmado.
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
                                Los pagos por transferencia bancaria pueden tomar hasta{' '}
                                {estimatedTime} en ser confirmados. Te enviaremos un email
                                cuando el pago sea procesado.
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
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        {isRefreshing ? 'Actualizando...' : 'Actualizar Estado'}
                    </button>
                    <button
                        onClick={handleViewDetails}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Ver Detalles
                    </button>
                </div>
                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Estado del Proceso
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Pago Iniciado</p>
                                <p className="text-sm text-gray-500">
                                    Tu solicitud de pago ha sido recibida
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">En Proceso</p>
                                <p className="text-sm text-gray-500">
                                    Verificando la transacción bancaria
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 text-sm">3</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-500">Confirmación</p>
                                <p className="text-sm text-gray-400">
                                    El pago será confirmado automáticamente
                                </p>
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
                            • Los pagos por transferencia pueden demorar hasta {estimatedTime}
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
