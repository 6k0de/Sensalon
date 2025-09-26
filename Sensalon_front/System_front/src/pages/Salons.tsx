import React, { useEffect, useState } from 'react'
import {
    MapIcon,
    ListIcon,
    ScissorsIcon
} from 'lucide-react'
import { SalonList } from '../components/Salons/salonsList'
import { SalonSearch } from '../components/Salons/salonSearch'
import { api } from '../utils/axiosClients'
export const Salons: React.FC = () => {
    const [salones, setSalones] = useState<any[]>([])
    const [filteredSalones, setFilteredSalones] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    const getAllSalons = async () => {
        setIsLoading(true)
        try {
            const salons = await api.get('/salons')
            setSalones(salons.data.salones)
            setFilteredSalones(salons.data.salones)
        }
        catch (error) {
            console.error('Error al cargar salones:', error)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        getAllSalons()
    }, [])
    const handleSearch = (searchTerm: string) => {
        console.log(searchTerm)
        if (!searchTerm.trim()) {
            setFilteredSalones(salones)
            return
        }

        const searchTermLower = searchTerm.toLowerCase()

        const filtered = salones.filter((salon) => {
            return (
                salon.nombreSalon?.toLowerCase().includes(searchTermLower) ||
                salon.direccion?.toLowerCase().includes(searchTermLower) ||
                salon.telefono?.toLowerCase().includes(searchTermLower) ||
                salon.correo?.toLowerCase().includes(searchTermLower)
            )
        })

        setFilteredSalones(filtered)
    }

    console.log(salones)
    return (
        <div className="mt-10">
            <div className="max-w-10xl mx-auto px-4 sm:px-6 pb-12">
                {/* Search */}
                <SalonSearch onSearch={handleSearch} />
                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="mb-4 sm:mb-0">
                        <p className="text-sm text-gray-600">
                            &nbsp;Mostrando{' '}
                            <span className="font-medium">{filteredSalones.length}</span>{' '}
                            salones
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex rounded-lg overflow-hidden border border-gray-300">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 flex items-center text-sm ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <ListIcon className="w-4 h-4 mr-2" />
                                Lista
                            </button>
                            {/*  <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-2 flex items-center text-sm ${viewMode === 'map' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <MapIcon className="w-4 h-4 mr-2" />
                                Mapa
                            </button> */}
                        </div>
                    </div>
                </div>
                {/* Content */}
                {viewMode === 'list' ? (
                    <>
                        <SalonList salones={filteredSalones} isLoading={isLoading} />
                        {!isLoading && filteredSalones.length === 0 && (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <ScissorsIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No se encontraron salones
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    No hay salones que coincidan con tu búsqueda. Intenta con
                                    otros términos.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Vista de mapa
                            </h3>
                            <p className="text-gray-600">
                                Próximamente: Visualización de salones en mapa
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
