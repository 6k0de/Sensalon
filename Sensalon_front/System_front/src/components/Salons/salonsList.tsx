import React from 'react'
import { SalonCard } from './salonsCard'
interface SalonListProps {
  salones: any[]
  isLoading?: boolean
}
export const SalonList: React.FC<SalonListProps> = ({
  salones,
  isLoading = false,
}) => {
  console.log(salones)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-gray-200 rounded-full mr-1"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4 mb-4">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-gray-200 rounded-full mr-3 mt-1"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (salones.length === 0) {
    return null // Manejo vacío se hace en SalonesPage
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {salones.map((salon) => (
        <SalonCard key={salon.correo} salon={salon} />
      ))}
    </div>
  )
}
