import { useEffect, useState } from "react";
import { TableOrdersPendingProps } from "../../utils/props/OrdersPending.props";
import { OrderPending } from "../../interfaces/ordersPending";
import { updateOrderPendingStatus } from "../../services/ordersPending/updateOrderPendingStatus";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Companie } from "../../interfaces/companies";
import { api } from "../../utils/axiosClients";
import { ModalProductsInTransactions } from "../Modals/modal.products.transaction";
import { formatValue } from "../../utils/formatters";

const detectPaymentMethod = (products: any) => {
  let raw = products;
  try {
    if (typeof raw === "string") {
      raw = JSON.parse(raw);
      if (typeof raw === "string") {
        raw = JSON.parse(raw);
      }
    }
  } catch {
    return "MercadoPago";
  }

  const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  const methodRaw = items.find((item: any) => item?.method)?.method;
  if (!methodRaw) return "MercadoPago";

  const method = String(methodRaw).toLowerCase();
  if (method.includes("transfer")) return "Transferencia Bancaria";
  if (method.includes("mercado")) return "MercadoPago";
  return String(methodRaw);
};

export const TableOrdersPending = ({
  encabezados,
  data,
  outofstock,
  fetch,
}: TableOrdersPendingProps) => {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Companie[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/empresas");
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching empresas:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setIsLoading(true);
    try {
      const res = await updateOrderPendingStatus(id, status);
      setToastMessage(res.message || "Estado actualizado correctamente");
      setToastType("success");
      setShowToast(true);
      fetch?.();
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || "Error al actualizar el estado");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
        setToastType(null);
      }, 4000);
    }
  };

  const handleViewProducts = (products: any) => {
    if (!products || products === "null") {
      setSelectedProducts([]);
      setSelectedMeta(null);
      setShowModal(true);
      return;
    }

    let parsed: any = products;
    try {
      if (typeof products === "string") {
        parsed = JSON.parse(products);
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
      }
    } catch {
      parsed = null;
    }

    let meta: any = null;
    let rawItems: any[] = [];

    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.items)) {
      rawItems = parsed.items;
      meta = parsed.meta || null;
    } else if (Array.isArray(parsed)) {
      rawItems = parsed;
    } else if (parsed?.Producto) {
      rawItems = [
        {
          name: parsed.Producto,
          quantity: 1,
          total: 0,
          companyId: "N/A",
          priceUnit: 0,
        },
      ];
    } else {
      rawItems = [];
    }

    const normalized = rawItems.map((p: any) => ({
      name: p.name || p.productName || "Producto desconocido",
      quantity: p.quantity || 1,
      priceUnit: p.priceUnit || p.price || 0,
      total: p.total || (p.priceUnit || p.price || 0) * (p.quantity || 1),
      companyId: p.companyId || p.companie || "N/A",
      image: p.image || null,
      iIdProduct: p.iIdProduct || p.productId || null,
      categoryIds: p.categoryIds || [],
    }));

    setSelectedProducts(normalized);
    setSelectedMeta(meta);
    setShowModal(true);
  };

  return (
    <>
      {isLoading && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
          aria-live="polite"
          aria-busy="true"
          role="status"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-white text-sm font-medium">Procesando...</p>
            <span className="sr-only">Cargando</span>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50">
        {toastMessage && toastType === "success" && (
          <SuccessToast message={toastMessage} showToast={showToast} />
        )}
        {toastMessage && toastType === "error" && (
          <ErrorToast message={toastMessage} showToast={showToast} />
        )}
      </div>

      <div className="relative shadow-md sm:rounded-lg custom-scrollbar max-h-[580px] overflow-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-sm text-[#393936] bg-[#f7f7f6] sticky top-0 z-10">
            <tr>
              {encabezados.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10"
                >
                  <div className="flex items-center">{header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((order: OrderPending, index: number) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {order.iIdOrderPending || "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.iIdOrderPending, e.target.value)
                      }
                      className="w-40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                                focus:ring-blue-500 focus:border-blue-500 block p-2.5 
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                                dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completada</option>
                      <option value="failed">Error</option>
                    </select>
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {formatValue(order.total)}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {order.user
                      ? `${order.user.vcfirstname} ${order.user.vclastname}`
                      : "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {detectPaymentMethod(order.products)}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {order.products && order.products !== "null" ? (
                      <button
                        onClick={() => handleViewProducts(order.products)}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Ver productos
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-lg">
                        Productos no disponibles
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={encabezados.length}
                  className="text-center py-4 text-lg "
                >
                  {outofstock}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ModalProductsInTransactions
          setShowModal={setShowModal}
          selectedProducts={selectedProducts}
          companies={companies}
          meta={selectedMeta}
        />
      )}
    </>
  );
};
