import React from 'react'
import { CreditCard } from 'lucide-react'
interface BankTransferButtonProps {
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  'data-id'?: string
}
export const BankTransferButton: React.FC<BankTransferButtonProps> = ({
  onClick,
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'data-id': dataId,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses =
    'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-300 border border-gray-900'
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  }
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-10',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses[size]} ${className}`}
      data-id={dataId}
      aria-label="Pagar por transferencia bancaria"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <CreditCard className={`${iconSizes[size]} flex-shrink-0`} />
          <span className="whitespace-nowrap">Transferencia Bancaria</span>
        </>
      )}
    </button>
  )
}
