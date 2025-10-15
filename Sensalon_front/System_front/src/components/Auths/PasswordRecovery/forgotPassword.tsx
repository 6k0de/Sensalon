import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { api } from "../../../utils/axiosClients";

export const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("El email es requerido");
            return;
        }
        const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!regex.test(email)) {
            setError("Ingresa un email válido");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // 👇 Aquí ya usas axios correctamente
            const res = await api.post("/forgot-password", { email });
            if (res.status !== 200) throw new Error("Error al enviar correo");
            setEmailSent(true);
            setTimeout(() => {
                navigate(`/verify-token?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setError("No pudimos enviar el correo, intenta de nuevo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {!emailSent ? (
                <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Mail className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            ¿Olvidaste tu contraseña?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Ingresa tu email y te enviaremos un código para recuperar tu
                            cuenta
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-6 w-6 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`block w-full pl-12 pr-3 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="tu@ejemplo.com"
                                />
                            </div>
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Código
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-base text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            ¿Recordaste tu contraseña? Iniciar sesión
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl text-center">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <Mail className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        ¡Email Enviado!
                    </h1>
                    <p className="text-gray-600 mb-4 text-lg">
                        Hemos enviado un código de verificación a:
                    </p>
                    <p className="font-medium text-gray-900 mb-8">{email}</p>
                    <p className="text-sm text-gray-500">
                        Redirigiendo automáticamente...
                    </p>
                </div>
            )}
        </div>
    );
};
