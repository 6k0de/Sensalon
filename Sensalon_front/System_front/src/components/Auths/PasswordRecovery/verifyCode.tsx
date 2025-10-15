import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "../../../utils/axiosClients";

export const VerifyToken: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 5 minutos en segundos
  const [canResend, setCanResend] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get("email") || "usuario@ejemplo.com";

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      setError("El código es obligatorio");
      return;
    }
    if (!/^[0-9]{6}$/.test(token)) {
      setError("El código debe tener 6 dígitos numéricos");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post("/verify-token", { email, token });

      if (res.status !== 200) throw new Error("Token inválido");

      // Token válido -> redirige a reset password
      navigate(
        `/reset-password?email=${encodeURIComponent(email)}&token=${token}`
      );
    } catch (err) {
      setError("El código es inválido o ha expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post("/forgot-password", { email });
      setTimeLeft(300);
      setCanResend(false);
      alert("Código reenviado al email");
    } catch {
      alert("No pudimos reenviar el código, intenta de nuevo");
    }
  };

  return (
    <div className="min-h-screen  bg-gray-100 flex items-center justify-center p-4 ">
      <main className="w-full max-w-lg ">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Verificar Código
              </h1>
            </div>
            <button
              onClick={() => navigate("/forgot-password")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifica tu Identidad
            </h2>
            <p className="text-gray-600 mb-4">
              Ingresa el código de 6 dígitos que enviamos a:
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Código de Verificación
              </label>
              <input
                type="text"
                id="token"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`block w-full px-3 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  error ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="000000"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  El código expira en:{" "}
                  <span className="font-mono font-medium">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-600">El código ha expirado</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || token.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Verificando...
                </>
              ) : (
                "Verificar Código"
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendCode}
                className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-500 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Reenviar código
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                ¿No recibiste el código? Podrás solicitar uno nuevo en{" "}
                {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:text-gray-500 transition-colors"
            >
              Cambiar email
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
