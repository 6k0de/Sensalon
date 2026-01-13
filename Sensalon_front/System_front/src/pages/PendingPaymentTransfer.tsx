import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { useCartStore } from "../hooks/useCartStore";

export const PaymentReviewInfo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((s: any) => s.clearCart);
  const syncCartToBackend = useCartStore((s: any) => s.syncCartToBackend);

  const orderNumber = searchParams.get("orderNumber") || "ORD-000000";

  useEffect(() => {
    clearCart();
    const cartId = localStorage.getItem("cartId");
    if (cartId) {
      syncCartToBackend(cartId);
    }
    localStorage.removeItem("cart-storage");
  }, [clearCart, syncCartToBackend]);

  return (
    <div className="flex flex-col pt-8">
      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg text-center border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 mx-auto rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Estamos revisando tu pago
          </h2>

          <p className="text-gray-700 mb-6">
            Tu pago mediante <strong>transferencia bancaria</strong> está siendo
            verificado por nuestro equipo. Una vez sea{" "}
            <strong>aprobado o rechazado</strong>, recibirás un correo con la
            confirmación de tu pedido.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg py-4 px-6 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Guarda tu número de orden:</strong>
            </p>
            <p className="text-xl font-mono text-blue-900 mt-2">
              {orderNumber}
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Este número te servirá para cualquier aclaración o seguimiento.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            <CheckCircle2 className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </main>

    </div>
  );
};
