import { CalendarDays, ChevronDown, ChevronUp, CreditCard, MapPin, Package } from 'lucide-react'
import { useState } from 'react'
import { Order } from '../../interfaces/orders'
import { OrderStatusBadage } from './OrderStatusBadage'
import { normalizeImageUrl } from '../../helpers/normalizeImage'

export const CardsOrders = ({ order }: { order: Order }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const formattedDate = new Date(order.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const formattedTime = new Date(order.date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    })
    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                {/* Order Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center">
                            <div className="bg-primary-50 p-2 rounded-full mr-3">
                                <Package className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{order.id}</h3>
                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarDays className="w-3.5 h-3.5 mr-1" />
                                    {formattedDate} • {formattedTime}
                                </div>
                            </div>
                        </div>
                        <OrderStatusBadage status={order.status} className="sm:ml-2" />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Total </p>
                            <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                           {/*  <span className='text-xs'>No incluye el envio</span> */}
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>
                {/* Order Items (always visible) */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col gap-4">
                        {order.items
                            .slice(0, isExpanded ? undefined : 2)
                            .map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={normalizeImageUrl(item.imageUrl)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        {!isExpanded && order.items.length > 2 && (
                            <p className="text-xs text-center text-gray-500">
                                + {order.items.length - 2} productos más
                            </p>
                        )}
                    </div>
                </div>
                {/* Expanded Details */}
                {isExpanded && (
                    <div className="p-5 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    Dirección de envío
                                </h4>
                                <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                                    <p className="text-gray-800">{order.shippingAddress.street}</p>
                                    <p className="text-gray-800">
                                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                        {order.shippingAddress.zipCode}
                                    </p>
                                    <p className="text-gray-800">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                    Método de pago
                                </h4>
                                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-800">
                                    {order.paymentMethod}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded transition-colors">
                                Ver detalles completos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
