import { useEffect, useState } from "react";
import { api } from "../utils/axiosClients";
import { FiPlus } from "react-icons/fi";
import { DiscountCode } from "../interfaces/discounts";
import { DiscountCodeModal } from "../components/Modals/modal.discounts";
import { SuccessToast } from "../components/Toast/successToast";
import { ErrorToast } from "../components/Toast/errorToast";
import { TableDiscountCodes } from "../components/Table/tableDiscountCodes";

export const DiscountCodesPage = () => {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<DiscountCode | null>(null);

    const fetchCodes = async () => {
        try {
            setIsLoading(true);
            const resp = await api.get("/discount-codes");
            const list: DiscountCode[] = resp?.data?.data || resp?.data || [];
            setCodes(list);
        } catch (error) {
            console.error("Error al obtener códigos de descuento:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const openCreateModal = () => {
        setEditingCode(null);
        setIsModalOpen(true);
    };

    const openEditModal = (code: DiscountCode) => {
        setEditingCode(code);
        setIsModalOpen(true);
    };

    const showToastMessage = (message: string, type: "success" | "error") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => {
            setToastMessage(null);
            setToastType(null);
            setShowToast(false);
        }, 3000);
    };

    const handleSave = async (
        data: Omit<DiscountCode, "id" | "usageCount" | "createdAt"> & { id?: string }
    ) => {
        try {
            // si trae id => editar, sino crear
            if (data.id) {
                await api.put(`/updateDiscount/${data.id}`, data);
                showToastMessage("Código actualizado correctamente.", "success");
            } else {
                await api.post(`/createDiscount`, data);
                showToastMessage("Código creado correctamente.", "success");
            }
            await fetchCodes();
        } catch (error) {
            console.error("Error guardando código de descuento:", error);
            const message =
                (error as any)?.response?.data?.message ||
                "No se pudo guardar el código de descuento.";
            showToastMessage(message, "error");
            throw error;
        }
    };

    const confirmDelete = (code: DiscountCode) => {
        setPendingDelete(code);
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await api.delete(`/discount-codes/${pendingDelete.id}`);
            showToastMessage("Código eliminado.", "success");
            await fetchCodes();
        } catch (error) {
            console.error("Error eliminando código de descuento:", error);
            const message =
                (error as any)?.response?.data?.message ||
                "No se pudo eliminar el código de descuento.";
            showToastMessage(message, "error");
        }
        setPendingDelete(null);
    };

    const formatScope = (code: DiscountCode) => {
        if (code.scope === "all") return "Todos los productos";
        return `Productos específicos (${code.productIds.length})`;
    };

    const formatUsage = (code: DiscountCode) => {
        if (code.usageLimitType === "unlimited") return "Ilimitado";
        return `${code.usageCount}/${code.usageLimit ?? 0} usos`;
    };

    return (
        <>
            <div className="fixed top-0 right-0 z-50 p-4">
                {toastMessage && toastType === "success" && (
                    <SuccessToast message={toastMessage} showToast={showToast} />
                )}
                {toastMessage && toastType === "error" && (
                    <ErrorToast message={toastMessage} showToast={showToast} />
                )}
            </div>
            <div className="py-12 px-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1d1d1b]">Códigos de descuento</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Administra promociones, límites de uso y productos vinculados.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2"
                    >
                        <FiPlus />
                        Crear código
                    </button>
                </div>

                <div className="bg-white shadow-sm p-4 rounded-xl h-full w-full">
                    <TableDiscountCodes
                        codes={codes}
                        isLoading={isLoading}
                        onEdit={openEditModal}
                        onDelete={confirmDelete}
                        formatScope={formatScope}
                        formatUsage={formatUsage}
                    />
                </div>

                {/* Modal */}
                <DiscountCodeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingCode}
                />

                {/* Modal confirmación borrado */}
                {pendingDelete && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Eliminar código
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                ¿Seguro que deseas eliminar el código "{pendingDelete.code}"? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => setPendingDelete(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
