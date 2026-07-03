import { useEffect, useState } from "react"
import { api } from "../../utils/axiosClients"
import { Supplier } from "../../interfaces/suppliers"
import { SuccessToast } from "../Toast/successToast"
import { ErrorToast } from "../Toast/errorToast"
import { Companie } from "../../interfaces/companies"
import { LineItem, ProductModal } from "../../interfaces/products"
import { Package } from "lucide-react"
import { WarehouseEntrance } from "../../interfaces/warehouse"
import { useLocation, useNavigate } from "react-router-dom"

type LocationState = {
    mode?: "edit" | "create"
    warehouse?: WarehouseEntrance
} | null

export const WareHouseForm = () => {
    const location = useLocation()
    const state = location.state as LocationState
    const editingWarehouse = state?.warehouse
    const isEditMode = !!editingWarehouse
    const navigate = useNavigate()

    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [supplierSelected, setSupplierSelected] = useState<string>('')
    const [company, setCompany] = useState<Companie[]>([])
    const [companySelected, setCompanySelected] = useState<string>('')
    const [docNumber, setDocNumber] = useState("")
    const [dateSelected, setDateSelected] = useState<string>("")
    const [reason, setReason] = useState("")
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [productsByBrand, setProductsByBrand] = useState<ProductModal[]>([]);
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const handleCancel = () => {
        navigate("/almacen");
    };



    const fetchSuppliersandCompany = async () => {
        try {
            const response = await api.get('/suppliers')
            const response2 = await api.get('/empresas')
            const suppliersData = response?.data?.suppliers || []
            const companiesData = response2?.data || []
            console.log(suppliersData)
            setSuppliers(suppliersData)
            setCompany(companiesData)
        } catch (error) {
            console.error("Error fetching proveedores o marcas :", error);
            setToastMessage("Error al obtener los proveedores o sin proveedores registrados o marcas fallidas");
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
        fetchSuppliersandCompany()
    }, [])

    useEffect(() => {
        if (!editingWarehouse) return;

        // docnumber puede ser number o string
        setDocNumber(editingWarehouse.docnumber?.toString() ?? "")

        // datebuy viene como "2025-12-16" según tu ejemplo → se puede usar directo
        // si en algún momento viene como ISO, usar split('T')[0]
        setDateSelected(editingWarehouse.datebuy.toString() ?? "")

        setReason(editingWarehouse.entryreason ?? "")
        setSupplierSelected(editingWarehouse.supplierId ?? "")
        setCompanySelected(editingWarehouse.companyId ?? "")

        // Parsear productlist
        if (editingWarehouse.productlist) {
            try {
                const parsed = JSON.parse(editingWarehouse.productlist) as LineItem[]
                setLineItems(parsed)
            } catch (err) {
                console.error("Error parseando productlist:", err)
            }
        }
    }, [editingWarehouse])

    const openProductsModal = async () => {
        if (!companySelected) return;

        try {
            // Ajusta esta ruta a tu backend real
            const resp = await api.get(`/productos/empresas/${companySelected}`);
            console.log(resp)
            const productos: ProductModal[] = resp?.data?.products || [];
            setProductsByBrand(productos);
            setSelectedProductIds([]); // limpia selección anterior
            setIsProductsModalOpen(true);
        } catch (error) {
            console.error("Error al obtener productos por marca:", error);
            setToastMessage("Error al obtener los productos de la marca seleccionada");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null)
                setToastType(null)
                setShowToast(false)
            }, 3000)
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación simple de campos obligatorios
        if (!dateSelected || !reason || !supplierSelected) {
            setToastMessage("Por favor completa todos los campos obligatorios.");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 3000);
            return;
        }

        if (lineItems.length === 0) {
            setToastMessage("Debes agregar al menos un producto.");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 3000);
            return;
        }

        try {
            // Si solo quieres guardar ciertos campos de cada producto en el JSON:
            const productosParaGuardar = lineItems.map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
                sku: item.sku,
                name: item.name,
                vcphoto: item.vcphoto, // opcional, si lo quieres almacenar
            }));

            // Convertimos a string JSON para mandarlo en un solo campo
            const productosJson = JSON.stringify(productosParaGuardar);

            const payload = {
                datebuy: dateSelected,
                entryreason: reason,
                supplierId: supplierSelected,
                companyId: companySelected,
                productlist: productosJson,
            };

            console.log("Payload a enviar:", payload);

            if (isEditMode && editingWarehouse) {
                await api.put(`/warehouseEntrance/${editingWarehouse.id}`, payload);
            } else {
                await api.post("/warehouseEntrance", payload);
            }

            setToastMessage(isEditMode ? "Entrada actualizada correctamente." : "Entrada guardada correctamente.");
            setToastType("success");
            setShowToast(true);


            if (!isEditMode) {
                // si es nuevo registro, limpias
                setDocNumber("");
                setDateSelected("");
                setReason("");
                setSupplierSelected("");
                setCompanySelected("");
                setLineItems([]);
            }

            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
                navigate("/almacen");
            }, 800);
        } catch (error) {
            console.error("Error al guardar la entrada:", error);
            setToastMessage("Ocurrió un error al guardar la entrada.");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 3000);
        }
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
            <div className="min-h-screen flex flex-col">
                <section className="pt-10">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block mb-2.5 text-sm font-medium text-heading">
                                    Num. Documento<span className="text-red-700">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    className="block w-full bg-gray-100 p-3 text-sm text-[#1d1d1b] border border-gray-300 rounded-lg dark:placeholder-gray-400 dark:text-white"
                                    placeholder=""
                                    value={docNumber}
                                    onChange={(e) => setDocNumber(e.target.value)}
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block mb-2.5 text-sm font-medium text-heading">
                                    Fecha <span className="text-red-700">*</span>
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v12a1 1 0 001 1z"
                                            />
                                        </svg>
                                    </div>

                                    <input
                                        type="date"
                                        className="block w-full pl-9 p-3 text-sm text-[#1d1d1b] border border-gray-300 rounded-lg dark:placeholder-gray-400 dark:text-white"
                                        value={dateSelected}
                                        onChange={(e) => setDateSelected(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2.5 text-sm font-medium text-heading">
                                    Motivo de entrada <span className="text-red-700">*</span>
                                </label>
                                <select
                                    id="motivo"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full p-3 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option selected>Selecciona una opción</option>
                                    <option value="compra">Compra</option>
                                    <option value="devolucionCliente">Devolución de cliente</option>
                                    <option value="devolucionDaño">Devolución por daños</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2.5 text-sm font-medium text-heading">
                                    Proveedor <span className="text-red-700">*</span>
                                </label>
                                <select
                                    value={supplierSelected}
                                    onChange={(e) => setSupplierSelected(e.target.value)}
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full p-3 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                >
                                    <option value="">Seleccione un proveedor</option>
                                    {suppliers.map((supp) => (
                                        <option key={supp.iIdSuppliers} value={supp.iIdSuppliers}>
                                            {supp.vcsupplier}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            {/* Campo Marcas */}
                            <div>
                                <label className="block mb-2.5 text-sm font-medium text-heading">
                                    Marcas <span className="text-red-700">*</span>
                                </label>
                                <select
                                    value={companySelected}
                                    onChange={(e) => setCompanySelected(e.target.value)}
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-3 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                >
                                    <option value="">Seleccione una marca</option>
                                    {company.map((comp) => (
                                        <option key={comp.iIdCompany} value={comp.iIdCompany}>
                                            {comp.vcname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botón Agregar productos */}
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    disabled={!companySelected}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium border transition w-full md:w-auto ${companySelected
                                        ? "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                                        : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                        }`}
                                    onClick={openProductsModal}
                                >
                                    Agregar productos
                                </button>
                            </div>
                        </div>

                        {/* Acciones del formulario */}
                        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            {/* Mensaje informativo */}
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-3a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 7a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>
                                    Agrega los productos y completa los campos requeridos antes de guardar.
                                </span>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 
                text-gray-600 bg-white transition hover:bg-gray-100 active:scale-[0.97]"
                                    onClick={handleCancel}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-md text-sm font-medium bg-green-600 
                text-white shadow hover:bg-green-700 active:scale-[0.97] transition"
                                >
                                    Guardar entrada
                                </button>
                            </div>

                        </div>

                    </form>

                </section>

                <section>
                    <section className="mt-6">
                        {lineItems.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No hay productos agregados</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Selecciona una marca y haz clic en "Agregar productos" para comenzar.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-4 py-3">Producto</th>
                                            <th className="px-4 py-3">Cantidad</th>
                                            <th className="px-4 py-3">Precio unitario</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {lineItems.map((item) => {
                                            console.log(item)
                                            const rowTotal = (item.quantity || 0) * (item.unitPrice || 0);
                                            const normalizedPath = item?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                                            const imageUrl = `http://localhost:3000/imagenes/${normalizedPath}`
                                            return (
                                                <tr key={item.productId} className="align-middle hover:bg-gray-50/60">
                                                    {/* Producto + SKU */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {/* Si quieres imagen aquí, puedes mapearla también desde ProductModal al guardar */}
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <img src={imageUrl} className="w-5 h-5 text-gray-300" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {item.name}
                                                                </p>
                                                                {item.sku && (
                                                                    <p className="text-xs text-gray-500">
                                                                        SKU: <span className="font-medium">{item.sku}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Cantidad */}
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            min={1}
                                                            className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                // permitir vacío momentáneo
                                                                if (value === "") {
                                                                    setLineItems((prev) =>
                                                                        prev.map((li) =>
                                                                            li.productId === item.productId ? { ...li, quantity: 0 } : li
                                                                        )
                                                                    );
                                                                    return;
                                                                }

                                                                const numeric = Number(value);
                                                                setLineItems((prev) =>
                                                                    prev.map((li) =>
                                                                        li.productId === item.productId
                                                                            ? { ...li, quantity: numeric }
                                                                            : li
                                                                    )
                                                                );
                                                            }}
                                                            onBlur={() => {
                                                                setLineItems((prev) =>
                                                                    prev.map((li) =>
                                                                        li.productId === item.productId
                                                                            ? { ...li, quantity: li.quantity < 1 ? 1 : li.quantity }
                                                                            : li
                                                                    )
                                                                );
                                                            }}
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </td>

                                                    {/* Precio unitario */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-400">$</span>
                                                            <input
                                                                type="text"
                                                                className="w-28 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                value={item.unitPrice}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value || 0);
                                                                    setLineItems((prev) =>
                                                                        prev.map((li) =>
                                                                            li.productId === item.productId
                                                                                ? { ...li, unitPrice: val }
                                                                                : li
                                                                        )
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Total por producto */}
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                        ${rowTotal.toFixed(2)}
                                                    </td>

                                                    {/* Acción quitar */}
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            className="text-xs text-red-500 hover:text-red-600"
                                                            onClick={() =>
                                                                setLineItems((prev) =>
                                                                    prev.filter((li) => li.productId !== item.productId)
                                                                )
                                                            }
                                                        >
                                                            Quitar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">
                                                Total general:
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                $
                                                {lineItems
                                                    .reduce(
                                                        (acc, li) => acc + (li.quantity || 0) * (li.unitPrice || 0),
                                                        0
                                                    )
                                                    .toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                        )}
                    </section>

                </section>


                {isProductsModalOpen && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-800">
                                        Seleccionar productos
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Marca seleccionada:{" "}
                                        <span className="font-medium text-gray-700">
                                            {
                                                company.find((c) => c?.iIdCompany?.toString() === companySelected)
                                                    ?.vcname
                                            }
                                        </span>
                                    </p>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={() => setIsProductsModalOpen(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Cuerpo: listado de productos */}
                            <div className="px-5 py-4 max-h-[480px] overflow-y-auto bg-gray-50">
                                {productsByBrand.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                                        <Package className="w-10 h-10 mb-3 text-gray-300" />
                                        <p className="text-sm">No se encontraron productos para esta marca.</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Verifica que la marca tenga productos activos en el catálogo.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Seleccionar todos */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="select-all-products"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                    checked={
                                                        productsByBrand.length > 0 &&
                                                        selectedProductIds.length === productsByBrand.length
                                                    }
                                                    onChange={() => {
                                                        if (selectedProductIds.length === productsByBrand.length) {
                                                            setSelectedProductIds([]);
                                                        } else {
                                                            setSelectedProductIds(productsByBrand.map((p) => p.iIdProduct));
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="select-all-products"
                                                    className="ml-2 text-sm text-gray-600"
                                                >
                                                    Seleccionar todos
                                                </label>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {selectedProductIds.length} seleccionados
                                            </span>
                                        </div>

                                        {/* Grid de productos */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {productsByBrand.map((prod) => {
                                                const isChecked = selectedProductIds.includes(prod.iIdProduct);
                                                const normalizedPath = prod?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                                                const imageUrl = `http://localhost:3000/imagenes/${normalizedPath}`
                                                return (
                                                    <button
                                                        key={prod.iIdProduct}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProductIds((prev) =>
                                                                prev.includes(prod.iIdProduct)
                                                                    ? prev.filter((id) => id !== prod.iIdProduct)
                                                                    : [...prev, prod.iIdProduct]
                                                            );
                                                        }}
                                                        className={`relative flex gap-3 items-center rounded-xl border px-3 py-3 text-left transition shadow-sm hover:shadow-md hover:border-blue-200 bg-white ${isChecked ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50/70" : ""
                                                            }`}
                                                    >
                                                        {/* Checkbox arriba a la izquierda */}
                                                        <div className="absolute top-2 left-2">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded bg-white"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    setSelectedProductIds((prev) =>
                                                                        prev.includes(prod.iIdProduct)
                                                                            ? prev.filter((id) => id !== prod.iIdProduct)
                                                                            : [...prev, prod.iIdProduct]
                                                                    );
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>

                                                        {/* Imagen del producto */}
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                            {prod.vcphoto ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={prod.vcname}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-7 h-7 text-gray-300" />
                                                            )}
                                                        </div>

                                                        {/* Info del producto */}
                                                        <div className="flex-1 pl-1">
                                                            <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                                                                {prod.vcname}
                                                            </p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                {prod.sku && (
                                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                                                                        SKU: <span className="ml-1 font-medium">{prod.sku}</span>
                                                                    </span>
                                                                )}
                                                                {typeof prod.defaultPrice === "number" && (
                                                                    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5">
                                                                        ${prod.defaultPrice.toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                <p className="text-xs text-gray-500">
                                    Productos seleccionados:{" "}
                                    <span className="font-semibold">
                                        {selectedProductIds.length}
                                    </span>
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 text-xs md:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white bg-gray-100"
                                        onClick={() => setIsProductsModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="px-4 py-2 text-xs md:text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        disabled={selectedProductIds.length === 0}
                                        onClick={() => {
                                            // Agregar productos seleccionados a la tabla
                                            setLineItems((prev) => {
                                                const mapExisting = new Map(
                                                    prev.map((li) => [li.productId, li])
                                                );

                                                const nuevos: LineItem[] = [...prev];

                                                productsByBrand
                                                    .filter((p) =>
                                                        selectedProductIds.includes(p.iIdProduct)
                                                    )
                                                    .forEach((p) => {
                                                        if (!mapExisting.has(p.iIdProduct)) {
                                                            nuevos.push({
                                                                productId: p.iIdProduct,
                                                                name: p.vcname,
                                                                sku: p.sku,
                                                                quantity: 1,
                                                                unitPrice: p.defaultPrice ?? 0,
                                                                vcphoto: p.vcphoto
                                                            });
                                                        }
                                                    });

                                                return nuevos;
                                            });

                                            setIsProductsModalOpen(false);
                                            setSelectedProductIds([]);
                                        }}
                                    >
                                        Agregar a la lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </>
    )
}
