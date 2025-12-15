import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import "./table.css";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { Distributor } from "../../interfaces/distributors";
import { api } from "../../utils/axiosClients";
import { ModalSuccesCancel } from "../Modals/modal.acceptcancel";
import { usePagination } from "../../hooks/usePaginations";

export const TableUserN = ({
  encabezados,
  data,
  outofstock,
  fetch,
  handleEdit,
}: {
  encabezados: string[];
  data: Distributor[] | any;
  outofstock: string | "";
  setShowModal: any;
  showModal: any;
  fetch: () => Promise<void>;
  handleEdit: (user: any, role: "Usuario" | "Salón" | "Distribuidor") => void;
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner
  const [showModal, setShowModal] = useState<boolean>(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const {
    page,
    totalPages,
    totalItems,
    pageItems,
    next,
    prev,
  } = usePagination<any>(data || [], 10); // 10 registros por página

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await api.delete(`/deleteuser/${id}`);
      await fetch?.(); // refrescar lista
      setShowModal(false);
      setToastMessage("Usuario eliminado correctamente ✅");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error eliminando usuario", error);
      setToastMessage("Error al eliminar el usuario ❌");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
      setShowModal(false);
      // Ocultar toast después de unos segundos
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      {/* Mostrar toasts si hay un mensaje */}
      <div className="fixed top-4 right-4 z-50">
        {toastMessage && toastType === "success" && (
          <SuccessToast message={toastMessage} showToast={showToast} />
        )}
        {toastMessage && toastType === "error" && (
          <ErrorToast message={toastMessage} showToast={showToast} />
        )}
      </div>

      {isProcessing && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      <div className="relative table-wrapper">
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
              <th
                scope="col"
                className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems && pageItems.length > 0 ? (
              pageItems?.map((userN: any, index: number) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {userN.nombres ? userN.nombres : "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {userN.apellidos ? userN.apellidos : "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {userN.username ? userN.username : "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {userN.email ? userN.email : "N/A"}
                  </td>
                  <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {userN.dtcreation
                      ? new Date(userN.dtcreation).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="flex gap-3 px-6 py-4 text-left">
                    <button
                      onClick={() => {
                        handleEdit(userN, "Usuario");
                      }}
                      className="font-medium text-[#393936] dark:text-blue-500 hover:underline"
                    >
                      <FaPenToSquare size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setUserToDelete(userN);
                        setShowModal(true);
                      }}
                      className="font-medium text-red-600 dark:text-blue-500 hover:underline"
                    >
                      <FaRegTrashCan size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={encabezados.length + 1}
                  className="text-center py-4 text-lg "
                >
                  {outofstock}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
          <span>
            Mostrando <strong>{pageItems.length}</strong> de{" "}
            <strong>{totalItems}</strong> registros
          </span>
          <div className="flex items-center gap-2 shadow bg-gray-200 rounded-lg p-2">
            <button
              onClick={prev}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-500 text-xs disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={next}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-500 text-xs disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <ModalSuccesCancel
        show={showModal}
        message={
          <>
            ¿Seguro que deseas eliminar al Usuario{" "}
            <strong>{userToDelete?.nombres}</strong>?
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => handleDelete(userToDelete.iIdUser)}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};
