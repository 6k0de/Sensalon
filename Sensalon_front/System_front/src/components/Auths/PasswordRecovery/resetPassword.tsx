import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "../../../utils/axiosClients";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: score * 20, label: "Débil", color: "bg-red-500" };
    if (score <= 3) return { strength: score * 20, label: "Media", color: "bg-yellow-500" };
    if (score <= 4) return { strength: score * 20, label: "Fuerte", color: "bg-green-500" };

    return { strength: 100, label: "Muy Fuerte", color: "bg-green-600" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post("/reset-password", {
        email,
        token,
        newPassword: password,
      });

      if (res.status !== 200) throw new Error("Error al cambiar contraseña");

      navigate(`/password-reset-success?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("El token es inválido o la sesión ha expirado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-100 ">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nueva Contraseña</h2>
            <p className="text-gray-600">Tu nueva contraseña debe ser diferente a la anterior</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-3 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    error ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-3 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    error ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Cambiando Contraseña...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
