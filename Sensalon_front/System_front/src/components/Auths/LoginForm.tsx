import { useState } from 'react'
import { Eye, EyeOff, User } from 'lucide-react';
import { LoginServices } from '../../services/Auth/login';
import { SuccessToast } from '../Toast/successToast';
import { ErrorToast } from '../Toast/errorToast';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../hooks/useCartStore';

export const LoginForm = () => {
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
        console.log(result)
        if (result.value === 0) {
            setToastMessage(result.message);
            setShowSuccessToast(true);
            // Redirigir si es exitoso
            const user = result.data.user ?? result.data
            await useCartStore.getState().setCartFromBackend(user.iIdUser);
            setTimeout(() => {
                setShowSuccessToast(false);
                //window.location.href = '/'; // Redirigir a la página principal
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
                    <img src="/img/SENSALON.png" alt="" className='w-[20rem] h-[11rem] object-cover mx-auto' />
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Bienvenido de vuelta!</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 max-w">
                        Inicia sesión para continuar con tu viaje hacia el cuidado capilar.
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

                            <div className="flex items-center justify-between">

                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-black hover:text-gray-800">
                                        Olvidaste tu contraseña?
                                    </Link>
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

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Nuevo En <span style={{ fontFamily: "SilverStreak" }}>SENSALON</span></h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Unete a nosotros y comienza a descubrir la belleza que llevas dentro
                        </p>
                        <a
                            href="/register"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Crear cuenta
                        </a>
                    </div>
                </div>
            </div>
        </>

    )
}
