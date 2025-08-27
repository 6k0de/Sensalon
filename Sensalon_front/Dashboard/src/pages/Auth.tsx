import  { useState } from 'react'
import { Eye, EyeOff, User } from 'lucide-react';
import { SuccessToast } from '../components/Toast/successToast';
import { ErrorToast } from '../components/Toast/errorToast';
import { LoginServices } from '../services/auth/login';



export const LoginAuth = () => {
    const [showPassword, setShowPassword] = useState(false);

    // Estados para el formulario de inicio de sesión
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Resetea los toasts
        setShowSuccessToast(false);
        setShowErrorToast(false);

        // Llamada al servicio de inicio de sesión
        const result = await LoginServices({ username, password });

        if (result.value === 0) {
            localStorage.setItem('isLoggedIn', 'true');
            setToastMessage(result.data.message);
            setShowSuccessToast(true);
            // Redirigir si es exitoso
            setTimeout(() => {
                setShowSuccessToast(false);
                window.location.href = '/productos'; // Redirigir a la página principal
            }, 1500);
        } else {
            // Mostrar toast de error
            setToastMessage(result.message);
            setShowErrorToast(true);
            setTimeout(() => {
                setShowErrorToast(false);
            }, 1500);
        }
    };
  return (
    <>
    <div className="fixed mt-5 right-5">
        {showSuccessToast && <SuccessToast message={toastMessage} showToast={showSuccessToast} />}
        {showErrorToast && <ErrorToast message={toastMessage} showToast={showErrorToast} />}
    </div>
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Bienvenido Administrador!</h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
                Inicia sesión y agrega mas contenido a tu sistema
            </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Nombre de usuario
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Constraseña
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Iniciar Sesión
                        </button>
            
                    </div>
                </form>


            </div>
        </div>
    </div>
</>
  )
}