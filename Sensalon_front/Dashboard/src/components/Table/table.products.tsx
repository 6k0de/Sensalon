import { useState } from "react";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import { Product } from "../../interfaces/products";
import './table.css';
import { deleteProduct } from "../../services/products/deleteProduct";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";
import { Spinner } from "../Spinner/spinner";
import { ModalSuccesCancel } from "../Modals/modal.acceptcancel";
import { BASE_URL_IMAGE_PROD } from "../../utils/axiosClients";

export const TableProducts = ({ encabezados, data, fetch, outofstock, handleEdit }: { encabezados: string[], data: Product[] | any, fetch: { (): void } | null, outofstock: string | '', setShowModal: any, showModal: any, handleEdit: (product: Product) => void }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner
    const [showModal, setShowModal] = useState<boolean>(false)
    const [userToDelete, setUserToDelete] = useState<any>(null)

    const handleDeleteProduct = async (id: string) => {
        setIsProcessing(true);
        try {
            const resultado = await deleteProduct(id);
            if (resultado.valor == 0) {
                setToastMessage(resultado.message);
                setToastType('success');
                setShowToast(true)
                fetch!()
            } else {
                setToastMessage(resultado.message);
                setToastType('error');
                setShowToast(true)
            }
        } catch (error) {
            setToastMessage('Fallo al eliminar el producto');
            setToastType('error');
            setShowToast(true)
        } finally {
            setShowModal(false)
            setIsProcessing(false);
        }

        // Limpiar el toast después de unos segundos
        setTimeout(() => {
            setToastMessage(null);
            setToastType(null);
            setShowToast(false)
        }, 3000); // 3 segundos
    };

    return (
        <>
            {/* Mostrar toasts si hay un mensaje */}
            <div className="fixed top-4 right-4 z-50">
                {toastMessage && toastType === "success" && <SuccessToast message={toastMessage} showToast={showToast} />}
                {toastMessage && toastType === "error" && <ErrorToast message={toastMessage} showToast={showToast} />}
            </div>

            {isProcessing && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Spinner />
                </div>
            )}

            {/* Agregar overflow en ambos ejes */}
            <div className="relative shadow-md sm:rounded-lg custom-scrollbar max-h-[580px] overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-[#393936] bg-[#f7f7f6] sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10" >
                                <span>Imagen</span>
                            </th>
                            {encabezados.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10">
                                    <div className="flex items-center">
                                        {header}
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-3 bg-[#f7f7f6] sticky top-0 z-10">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((product: Product, index: number) => {
                                // Calcular la ruta normalizada para la imagen
                                const normalizedPath = product.vcphoto
                                    ? product.vcphoto.replace(/\\/g, '/').split('/imagenes/')[1]
                                    : null;
                                // Construir la URL completa de la imagen
                                const imageUrl = normalizedPath
                                    ? `${BASE_URL_IMAGE_PROD}/${normalizedPath}`
                                    : 'ruta-imagen-por-defecto'; // Usa una imagen por defecto si vcphoto es nulo
                                
                                return (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        {/* Celda de Imagen */}
                                        <td className="px-5 py-2 align-middle">
                                            {normalizedPath ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.vcname}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span>Sin imagen</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white align-middle">
                                            {product.vcname}
                                        </td>
                                        <td className="px-6 py-2 align-middle">{product.vcdescription}</td>
                                        <td className="px-6 py-2 align-middle">{product.vcweight}</td>
                                        <td className="px-6 py-2 align-middle">{product.vcquantity || 'N/A'}</td>
                                        <td className="px-6 py-2 align-middle">{product.decprice1}</td>
                                        <td className="px-6 py-2 align-middle">{product.decprice2}</td>
                                        <td className="px-6 py-2 align-middle">{product.decprice3}</td>
                                        <td className="px-10 py-2 align-middle">{product.istock}</td>
                                        <td className="px-10 py-2 align-middle">{product.istocklimit}</td>
                                        <td className="px-6 py-2 align-middle">
                                            {new Date(product.dtcreation).toLocaleDateString()}
                                        </td>
                                        {/* Botones de Acción */}
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="font-medium text-[#393936] dark:text-blue-500 hover:underline"
                                                >
                                                    <FaPenToSquare size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(product);
                                                        setShowModal(true);
                                                    }}
                                                    className="font-medium text-red-600 dark:text-blue-500 hover:underline"
                                                >
                                                    <FaRegTrashCan size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={encabezados.length + 2} className="text-center py-4 text-lg">
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
                        ¿Seguro que deseas eliminar el Producto{" "}
                        <strong>{userToDelete?.vcname}</strong>?
                    </>
                }
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={() => handleDeleteProduct(userToDelete.iIdProduct)}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
};
