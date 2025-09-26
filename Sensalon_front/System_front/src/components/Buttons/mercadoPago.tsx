import React from 'react'

interface MercadoPagoButtonProps {
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  'data-id'?: string
}

export const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
  onClick,
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'data-id': dataId,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-3 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses =
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 border border-blue-600'
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  }
  const logoSizes = {
    sm: 'max-h-4',
    md: 'max-h-5',
    lg: 'max-h-7',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses[size]} ${className}`}
      data-id={dataId}
      aria-label="Pagar con Mercado Pago"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <img
            src="/img/mercadopago.webp"
            alt="Mercado Pago"
            className={`${logoSizes[size]} object-contain`}
          />
          <span className="leading-none">Mercado Pago</span>
        </>
      )}
    </button>
  )
}
