import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import "./table.css";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { Distributor } from "../../interfaces/distributors";
import { api, BASE_URL_FILES } from "../../utils/axiosClients";
import { ModalSuccesCancel } from "../Modals/modal.acceptcancel";

export const TableUserDist = ({
  encabezados,
  data,
  fetch,
  outofstock,
  handleEdit,
}: {
  encabezados: string[];
  data: Distributor[] | any;
  fetch: { (): void } | null;
  outofstock: string | "";
  setShowModal: any;
  showModal: any;
  handleEdit: (user: any, role: "Usuario" | "Salón" | "Distribuidor") => void;
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner
  const [showModal, setShowModal] = useState<boolean>(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await api.delete(`/deleteuserdistributor/${id}`);
      await fetch?.(); // refrescar lista
      setShowModal(false);
      setToastMessage("Distribuidor eliminado correctamente ✅");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error eliminando el distribuidor", error);
      setToastMessage("Error al eliminar el distribuidor ❌");
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

      <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg h-auto custom-scrollbar">
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
            {data && data.length > 0 ? (
              data?.map(
                (userDistribiutor: Distributor | any, index: number) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.nombres || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.apellidos || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.username || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white align-top">
                      {userDistribiutor.companies_names_array &&
                        JSON.parse(userDistribiutor.companies_names_array)
                          .length > 0 &&
                        !JSON.parse(
                          userDistribiutor.companies_names_array,
                        ).includes(null) ? (
                        <ul className="flex flex-col gap-1">
                          {[
                            ...new Set(
                              JSON.parse(
                                userDistribiutor.companies_names_array,
                              ),
                            ),
                          ].map((marca: any, idx) => (
                            <li key={idx}>
                              <span className="inline-block bg-[#f3f3f1] dark:bg-gray-800 text-[#393936] dark:text-white rounded-full px-2 py-[2px] text-[11px] font-medium border border-[#e5e5e5]">
                                {marca}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.direccion || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.estado || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.ciudad || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.codigoPostal || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.pais || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.telefono || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.correo || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.rfc || "N/A"}
                    </td>
                    <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {userDistribiutor.vcconstfisc &&
                        userDistribiutor.vcconstfisc.includes(
                          "/assets/archivos/",
                        ) ? (
                        <button
                          onClick={() => {
                            // Extraemos solo el nombre del archivo desde la ruta
                            const normalizedPath =
                              userDistribiutor.vcconstfisc.split(
                                "/assets/archivos/",
                              )[1];
                            const url = `${BASE_URL_FILES}/archivos/${normalizedPath}`;

                            // Descargar el archivo
                            window.open(url, "_blank"); // Abre la descarga en una nueva pestaña
                          }}
                          className="text-blue-500 underline"
                        >
                          Descargar constancia
                        </button>
                      ) : (
                        <span>Pendiente</span>
                      )}
                    </td>
                    <td className="px-5 py-2 justify-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {new Date(
                        userDistribiutor.dtcreation,
                      ).toLocaleDateString() || "N/A"}
                    </td>
                    <td className="flex gap-3 px-6 py-4 text-left">
                      <button
                        onClick={() => {
                          handleEdit(
                            {
                              ...userDistribiutor,
                              empresasRelacionadas:
                                userDistribiutor.vccompanies, // <-- ASÍ
                            },
                            "Distribuidor",
                          );
                        }}
                        className="font-medium text-[#393936] dark:text-blue-500 hover:underline"
                      >
                        <FaPenToSquare size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(userDistribiutor);
                          setShowModal(true);
                        }}
                        className="font-medium text-red-600 dark:text-blue-500 hover:underline"
                      >
                        <FaRegTrashCan size={18} />
                      </button>
                    </td>
                  </tr>
                ),
              )
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
      <ModalSuccesCancel
        show={showModal}
        message={
          <>
            ¿Seguro que deseas eliminar al Distribuidor{" "}
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
