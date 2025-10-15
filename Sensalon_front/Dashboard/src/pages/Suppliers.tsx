import { useEffect, useState } from "react"
import { ModalSuppliers } from "../components/Modals/modal.suppliers"
import { Supplier } from "../interfaces/suppliers"
import { SuccessToast } from "../components/Toast/successToast"
import { ErrorToast } from "../components/Toast/errorToast"
import { TableSupplier } from "../components/Table/tableSupplier"
import { HEADER_TABLE_SUPPLIER } from "../utils/headers/Suppliers"
import { api } from "../utils/axiosClients"

export const Suppliers = () => {
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [mode, setMode] = useState(0);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [suppliers, setSuppliers] = useState<Supplier[]>([])

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers')
            console.log(response)
            const suppliersData = response?.data?.suppliers || []
            console.log(suppliersData)
            setSuppliers(suppliersData)
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            setToastMessage("Error al obtener los proveedores o sin proveedores registrados");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 3000);
        }
    }

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const handleModalClose = async (message: string, type: "success" | "error" | null) => {
        setShowModal(false);
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        if (type == "success") {
            await fetchSuppliers();
        }

        setTimeout(() => {
            setToastMessage(null);
            setToastType(null);
            setShowToast(false);
        }, 3000);
    };

    console.log(suppliers)
    const filteredSuppliers = suppliers?.filter(supplier =>
        supplier?.vcsupplier?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        supplier?.vcrfc?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        supplier?.vcemail?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        supplier?.vcrazonsocial?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        supplier?.vcphone?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    const handleCreateNewSupplier = () => {
        setMode(0); // Cambiar a modo de creación
        setSelectedSupplier(null); // Limpiar el proveedor seleccionado
        setShowModal(true); // Mostrar el modal
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setMode(1); // Cambiar a modo de edición
        setSelectedSupplier(supplier); // Establecer el proveedor seleccionado
        setShowModal(true); // Mostrar el modal
    }
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
            <div className="py-12 px-5 ">
                <h1 className="text-3xl font-bold text-[#1d1d1b]">Proveedores</h1>
                <section className="mt-5">
                    <div className="flex items-center justify-between bg-white shadow-sm w-full p-4 rounded-xl">
                        <div>
                            <label className="mb-2 text-sm font-medium text-[#1d1d1b] sr-only dark:text-white">
                                Search
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value) }}
                                    className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Search"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                data-modal-target="crud-modal"
                                onClick={handleCreateNewSupplier}
                                data-modal-toggle="crud-modal"
                                type="button"
                                className="text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2 me-2 mb-2 "
                            >
                                Nuevo Proveedor
                            </button>
                            {
                                showModal &&
                                <ModalSuppliers mode={mode} data={selectedSupplier || []} show={showModal} onClose={(message: string, type: "success" | "error" | null) => handleModalClose(message, type)} />
                            }
                        </div>
                    </div>
                    <div className="mt-5 bg-white shadow-sm p-4 rounded-xl w-full">
                        <TableSupplier
                            encabezados={HEADER_TABLE_SUPPLIER}
                            data={filteredSuppliers}
                            fetch={fetchSuppliers}
                            outofstock="Proveedores no registrados"
                            setShowModal={setShowModal}
                            showModal={showModal}
                            handleEdit={handleEditSupplier}
                        />
                    </div>
                </section>
            </div>
        </>

    )
}