import React from 'react'
import { MapPinIcon, PhoneIcon, ClockIcon } from 'lucide-react'
interface SalonCardProps {
    salon: any
}
export const SalonCard: React.FC<SalonCardProps> = ({ salon }) => {
    console.log(salon)
    const { nombreSalon, direccion, telefono, horaApertura, horaCierre } =
        salon
    const direccionCompleta = `${direccion}`
    // Generar un color de fondo basado en el nombre del salón para diferenciarlos visualmente
    const getColorClass = () => {
        const colors = [
            'bg-rose-100 border-rose-300',
            'bg-sky-100 border-sky-300',
            'bg-amber-100 border-amber-300',
            'bg-emerald-100 border-emerald-300',
            'bg-violet-100 border-violet-300',
            'bg-fuchsia-100 border-fuchsia-300',
        ]
        // Usar la suma de los códigos de caracteres del nombre para seleccionar un color
        const sum = nombreSalon
            .split('')
            .reduce((acc: any, char: string) => acc + char.charCodeAt(0), 0)
        return colors[sum % colors.length]
    }
    const colorClass = getColorClass()

    // Obtener iniciales del nombre para el avatar
    const getInitials = () => {
        return nombreSalon
            .split(' ')
            .map((word: string) => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }
    return (
        <div
            className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border `}
        >
            <div className={`p-6 ${colorClass}`}>
                <div className="flex items-center">
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mr-4 bg-gray-50`}
                    >
                        {getInitials()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{nombreSalon}</h3>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white">
                <div className="space-y-4 text-gray-600 mb-6">
                    <div className="flex items-start">
                        <MapPinIcon className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-sm">{direccionCompleta}</p>
                    </div>
                    <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                        <a
                            href={`tel:${telefono}`}
                            className="text-sm hover:text-primary-600 transition-colors"
                        >
                            {telefono}
                        </a>
                    </div>
                    <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                        <p className="text-sm">
                            <span className="font-medium">Horario:</span> {`${horaApertura?.substring(0, 5)} - ${horaCierre?.substring(0, 5)}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
