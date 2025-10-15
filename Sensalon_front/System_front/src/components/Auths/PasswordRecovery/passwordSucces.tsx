import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Home, LogIn } from 'lucide-react'
export const PasswordResetSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const email = searchParams.get('email') || ''
  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])
  const handleLoginNow = () => {
    navigate('/')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Contraseña Actualizada
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              Inicio
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Contraseña Actualizada!
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Tu contraseña ha sido cambiada exitosamente
          </p>
          {email && (
            <p className="text-gray-500 mb-8">
              para la cuenta: <span className="font-medium">{email}</span>
            </p>
          )}
          {/* Countdown */}
          <div className="bg-green-50 rounded-lg p-4 mb-8">
            <p className="text-green-800">
              Serás redirigido al login en{' '}
              <span className="font-bold text-xl">{countdown}</span> segundos
            </p>
          </div>
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLoginNow}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión Ahora
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5" />
              Ir al Inicio
            </button>
          </div>
        </div>
        {/* Security Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Consejos de Seguridad
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>No compartas tu contraseña con nadie</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Usa contraseñas únicas para cada cuenta</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Considera usar un administrador de contraseñas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Activa la autenticación de dos factores cuando sea posible
              </span>
            </div>
          </div>
        </div>
        {/* Additional Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            ¿Tienes problemas para iniciar sesión?
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
          >
            Contactar Soporte
          </button>
        </div>
      </main>
    </div>
  )
}
