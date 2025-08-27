import { Link } from "react-router-dom"

export const Footer = () => {
    return (
        <footer className="relative z-10 bg-gray-100 py-8 mt-auto w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-1">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-gray-600 mb-4 sm:mb-0">© 2024 <a className="cursor-pointer font-bold">Sensalon</a></p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <Link to='/avisoprivacidad' className="text-sm text-gray-500 hover:text-gray-900">Aviso de privacidad</Link>
                        <Link to='/terminos'  className="text-sm text-gray-500 hover:text-gray-900">Términos & Condiciones</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
