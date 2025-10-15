import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
interface OrderPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
const OrderPagination: React.FC<OrderPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null
  const renderPageButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    // Always show first page
    buttons.push(
      <button
        key="page-1"
        onClick={() => onPageChange(1)}
        className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 1 ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-700 hover:bg-gray-100'}`}
      >
        1
      </button>,
    )
    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3)
    // Adjust start if end is maxed out
    if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 3)
    }
    // Show ellipsis if there's a gap after page 1
    if (startPage > 2) {
      buttons.push(
        <span
          key="ellipsis-1"
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          ...
        </span>,
      )
    }
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={`page-${i}`}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === i ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {i}
        </button>,
      )
    }
    // Show ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      buttons.push(
        <span
          key="ellipsis-2"
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          ...
        </span>,
      )
    }
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={`page-${totalPages}`}
          onClick={() => onPageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === totalPages ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {totalPages}
        </button>,
      )
    }
    return buttons
  }
  return (
    <div className="flex items-center justify-between mt-8 border-t border-gray-200 pt-6">
      <div className="text-sm text-gray-500">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center justify-center p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {renderPageButtons()}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
export default OrderPagination
