import React from 'react'
import { PackageOpen, SlidersHorizontal } from 'lucide-react'
import { Order } from '../../interfaces/orders'
import { CardsOrders } from './CardsOrders'
interface OrderListProps {
  orders: Order[]
  isLoading?: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
}
const OrderList: React.FC<OrderListProps> = ({
  orders,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full w-10 h-10 mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded-full w-8"></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron pedidos
        </h3>
        <p className="text-gray-600 mb-6 text-balance">
           No has realizado ningún pedido o no tienes pedidos que coincidan con los filtros seleccionados
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Ajustar filtros
          </button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="space-y-4">
        {orders.map((order) => (
          <CardsOrders key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}
export default OrderList
