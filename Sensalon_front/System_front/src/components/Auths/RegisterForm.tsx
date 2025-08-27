import React, { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { RegisterServices } from '../../services/Auth/register'
import { SuccessToast } from '../Toast/successToast'
import { ErrorToast } from '../Toast/errorToast'

export const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [confirmShowPassword, setconfirmShowPassword] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const passwordsMatch = confirmPassword === '' || password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setShowSuccessToast(false);
        setShowErrorToast(false);
        console.log('Registration attempted with:', { firstName, lastName, username, email, password, confirmPassword })
        try {
            const result = await RegisterServices({ firstName, lastName, username, email, password });
            setToastMessage(result.message);
            setShowSuccessToast(true);
            setTimeout(() => {
                setShowSuccessToast(false);
                window.location.href = '/';
            }, 1500);
        } catch (error: any) {
            setToastMessage(error.message);
            setShowErrorToast(true);
            setTimeout(() => {
                setShowErrorToast(false);
            }, 1500);
        }
    }
    return (
        <>
            <div className="fixed mt-5 right-5">
                {showSuccessToast && <SuccessToast message={toastMessage} showToast={showSuccessToast} />}
                {showErrorToast && <ErrorToast message={toastMessage} showToast={showErrorToast} />}
            </div>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-2">SENSALON</h1>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crea tu cuenta </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 max-w">
                        Unete a nuestra comunidad donde descubriras productos para el cuidado de tu belleza
                    </p>
                </div>

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        Nombres
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Apellidos
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo electronico
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
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
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmar Contraseña
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={confirmShowPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setconfirmShowPassword(!confirmShowPassword)}
                                    >
                                        {confirmShowPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {!passwordsMatch && confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600" id="password-error">
                                        Las contraseñas no coinciden
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                    Acepto los{' '}
                                    <a href="#" className="font-medium text-black hover:text-gray-800">
                                        terminos y condiciones
                                    </a>
                                </label>
                            </div>

                            <div>
                                <button
                                    disabled={!acceptedTerms}
                                    type="submit"
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${acceptedTerms
                                        ? 'bg-black hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Crear cuenta
                                </button>

                                <p className='text-center mt-4'>Si ya tienes una cuenta <a
                                    href="/login"
                                    className="text-blue-700"
                                >
                                    Inicia sesión
                                </a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
