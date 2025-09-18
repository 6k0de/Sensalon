import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import "./table.css";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { Distributor } from "../../interfaces/distributors";

export const TableUserN = ({
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
  const [toastMessage] = useState<string | null>(null);
  const [toastType] = useState<"success" | "error" | null>(null);
  const [showToast] = useState(true);
  const [isProcessing] = useState(false); // Estado para el spinner

  console.log(data);
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

      <div className="relative overflow-x-auto w-full">
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
              data?.map((userN: any, index: number) => (
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
                      onClick={() => {}}
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
    </>
  );
};
