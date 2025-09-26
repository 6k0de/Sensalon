import React, { useState } from 'react'
import { MapPinIcon, ScissorsIcon } from 'lucide-react'
interface SalonSearchProps {
    onSearch: (searchTerm: string) => void
}
export const SalonSearch: React.FC<SalonSearchProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        onSearch(value)
    }
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
                <ScissorsIcon className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Encuentra tu salón</h2>
            </div>
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por ciudad, estado o código postal"
                    className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                    value={searchTerm}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}
