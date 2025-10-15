import { OrderStatus } from '../../interfaces/orders'
import { CheckCircle, Clock, PackageCheck } from 'lucide-react'

type Props = {
    status: OrderStatus
    className?: string
    showIcon?: boolean
}

export const OrderStatusBadage = ({ status, className, showIcon }: Props) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'processing':
                return {
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Procesando',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700',
                    borderColor: 'border-blue-200',
                }
            case 'approved':
                return {
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: 'Aprobado',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-200',
                }
            case 'error':
                return {
                    icon: <PackageCheck className="w-4 h-4" />,
                    label: 'Error',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200',
                }
            default:
                return {
                    icon: <PackageCheck className="w-4 h-4" />,
                    label: 'Desconocido',
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-200',
                }
        }
    }

    const { icon, label, bgColor, textColor, borderColor } = getStatusConfig()
    return (
        <>
            <div
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} border ${borderColor} ${className}`}
            >
                {showIcon && <span className="mr-1">{icon}</span>}
                {label}
            </div>
        </>
    )
}