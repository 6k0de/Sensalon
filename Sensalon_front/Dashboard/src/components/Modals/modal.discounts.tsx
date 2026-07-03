import { useEffect, useState } from "react";
import { ProductModal } from "../../interfaces/products";
import { api } from "../../utils/axiosClients";
import {
    DiscountCode,
    DiscountScope,
    UsageLimitType,
    DiscountType,
} from "../../interfaces/discounts";
import { SuccessToast } from "../Toast/successToast";
import { ErrorToast } from "../Toast/errorToast";

interface DiscountCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        data: Omit<DiscountCode, "id" | "usageCount" | "createdAt"> & { id?: string }
    ) => Promise<void> | void;
    initialData?: DiscountCode | null;
}

export const DiscountCodeModal: React.FC<DiscountCodeModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<DiscountType>("PERCENT");
    const [value, setValue] = useState<number>(10);
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [scope, setScope] = useState<DiscountScope>("all");
    const [usageLimitType, setUsageLimitType] = useState<UsageLimitType>("limited");
    const [usageLimit, setUsageLimit] = useState<number>(1);
    const [minSubtotal, setMinSubtotal] = useState<number | null>(null);

    const [productIds, setProductIds] = useState<string[]>([]);
    const [products, setProducts] = useState<ProductModal[]>([]);
    const [productSearch, setProductSearch] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);

    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(false);

    // cargar productos cuando se abre el modal
    useEffect(() => {
        if (!isOpen) return;

        const fetchProducts = async () => {
            try {
                const resp = await api.get("/productos");
                const list: ProductModal[] = resp?.data || [];
                setProducts(list);
            } catch (error) {
                console.error("Error al obtener productos para descuentos:", error);
            }
        };

        fetchProducts();
    }, [isOpen]);

    // rellenar datos cuando hay initialData (editar) o resetear al abrir vacío
    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setDescription((initialData as any).description ?? "");
            setDiscountType(initialData.discountType ?? "PERCENT");
            setValue(initialData.value);
            setScope(initialData.scope);
            setUsageLimitType(initialData.usageLimitType);
            setUsageLimit(initialData.usageLimit ?? 1);
            setProductIds(initialData.productIds || []);
            setMinSubtotal(
                typeof initialData.minSubtotal === "number"
                    ? initialData.minSubtotal
                    : null
            );
            setIsActive(initialData.isActive);
            const toLocalInput = (dateValue?: string | null) => {
                if (!dateValue) return "";
                const d = new Date(dateValue);
                if (Number.isNaN(d.getTime())) return "";
                return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
            };
            setStartDate(toLocalInput(initialData.startDate));
            setEndDate(toLocalInput(initialData.endDate));
        } else {
            setCode("");
            setDescription("");
            setDiscountType("PERCENT");
            setValue(10);
            setScope("all");
            setUsageLimitType("limited");
            setUsageLimit(1);
            setProductIds([]);
            setMinSubtotal(null);
            setIsActive(true);
            setStartDate("");
            setEndDate("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const toggleProduct = (id: string) => {
        setProductIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const triggerToast = (message: string, type: "success" | "error") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setToastMessage(null);
            setToastType(null);
            setShowToast(false);
        }, 2500);
    };

    const handleSave = async () => {
        if (!code.trim()) {
            triggerToast("El código de descuento es obligatorio.", "error");
            return;
        }

        if (!value || value <= 0) {
            triggerToast(
                discountType === "PERCENT"
                    ? "El porcentaje debe ser mayor a 0."
                    : "El monto debe ser mayor a 0.",
                "error"
            );
            return;
        }

        if (discountType === "PERCENT" && value > 100) {
            triggerToast("El porcentaje no puede ser mayor a 100%.", "error");
            return;
        }

        if (scope === "products" && productIds.length === 0) {
            triggerToast("Selecciona al menos un producto.", "error");
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                id: initialData?.id,
                code: code.trim().toUpperCase(),
                description: description.trim(),
                discountType,
                value,
                scope,
                productIds,
                usageLimitType,
                usageLimit: usageLimitType === "limited" ? usageLimit : null,
                minSubtotal: minSubtotal && minSubtotal > 0 ? minSubtotal : null,
                isActive,
                startDate: startDate || null,
                endDate: endDate || null,
            });
            triggerToast(
                isEditing ? "Cambios guardados correctamente." : "Código creado correctamente.",
                "success"
            );
            onClose();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "No se pudo guardar el código, intenta nuevamente.";
            triggerToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const isEditing = Boolean(initialData);
    const filteredProducts = products.filter((p) => {
        if (!productSearch.trim()) return true;
        const term = productSearch.toLowerCase();
        return (
            p.vcname?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
            <div className="fixed top-0 right-0 z-[2100] p-4">
                {toastMessage && toastType === "success" && (
                    <SuccessToast message={toastMessage} showToast={showToast} />
                )}
                {toastMessage && toastType === "error" && (
                    <ErrorToast message={toastMessage} showToast={showToast} />
                )}
            </div>
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[2050]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">
                        {isEditing ? "Editar código de descuento" : "Crear código de descuento"}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* === Sección: Datos básicos del código === */}
                    <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-4 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Datos del código
                            </h3>
                            <span className="text-xs text-gray-400">
                                Define el identificador y el tipo de descuento
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Código */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Código de descuento <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="EJEMPLO10"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <p className="text-xs text-gray-400">
                                    Se recomienda usar mayúsculas y sin espacios (ej. SENSALON10).
                                </p>
                            </div>

                            {/* Tipo + valor */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Tipo de descuento */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tipo de descuento
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={discountType}
                                        onChange={(e) => {
                                            const next = e.target.value as DiscountType;
                                            setDiscountType(next);
                                        }}
                                    >
                                        <option value="PERCENT">Porcentaje</option>
                                        <option value="FIXED">Monto fijo</option>
                                    </select>
                                </div>

                                {/* Valor */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {discountType === "PERCENT"
                                            ? "% de descuento"
                                            : "Monto de descuento"}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            min={1}
                                            max={discountType === "PERCENT" ? 100 : undefined}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            value={value}
                                            onChange={(e) => setValue(Number(e.target.value || 0))}
                                        />
                                        <span className="text-sm text-gray-500">
                                            {discountType === "PERCENT" ? "%" : "$"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ej. Descuento de verano aplicable a productos seleccionados."
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fecha de inicio (opcional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fecha de término (opcional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === Sección: Alcance y condiciones === */}
                    <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Alcance y condiciones
                            </h3>
                            <span className="text-xs text-gray-400">
                                Define dónde y cuándo aplica el descuento
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Alcance (scope) */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Alcance del descuento
                                </label>
                                <div className="flex flex-col gap-2 text-sm">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="all"
                                            checked={scope === "all"}
                                            onChange={() => setScope("all")}
                                        />
                                        <span>General (todos los productos)</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="products"
                                            checked={scope === "products"}
                                            onChange={() => setScope("products")}
                                        />
                                        <span>Solo productos específicos</span>
                                    </label>
                                </div>
                            </div>

                            {/* Monto mínimo opcional */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Monto mínimo de compra (opcional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={minSubtotal ?? ""}
                                        onChange={(e) =>
                                            setMinSubtotal(
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                        placeholder="Ej. 1000"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                    Si lo dejas vacío, el cupón se puede aplicar sin monto mínimo.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* === Sección: Productos vinculados === */}
                    {scope === "products" && (
                        <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Productos vinculados
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        El descuento solo se aplicará a estos productos
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {productIds.length} seleccionados
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Buscar producto
                                    </label>
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nombre o SKU"
                                    />
                                </div>
                                <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto text-sm bg-white">
                                    {filteredProducts.length === 0 ? (
                                        <div className="p-3 text-gray-500 text-center">
                                            No hay productos disponibles.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-100">
                                            {filteredProducts.map((p) => {
                                                const isSelected = productIds.includes(String(p.iIdProduct));
                                                let imageUrl: string | null = null;

                                                if (p.vcphoto) {
                                                    const normalizedPath = p.vcphoto
                                                        .replace(/\\/g, "/")
                                                        .split("/imagenes/")[1];
                                                    imageUrl = `http://localhost:3000/imagenes/${normalizedPath}`;
                                                }

                                                return (
                                                    <li key={p.iIdProduct}>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleProduct(String(p.iIdProduct))}
                                                            className={`w-full flex items-center justify-between px-3 py-3 text-left transition ${isSelected
                                                                ? "bg-blue-50/70 ring-1 ring-blue-400"
                                                                : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {/* Imagen */}
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                                    {imageUrl ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={p.vcname}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 text-center px-1">
                                                                            Sin imagen
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                                        {p.vcname}
                                                                    </p>
                                                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                        {p.sku && (
                                                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                                                                                SKU:{" "}
                                                                                <span className="ml-1 font-medium">{p.sku}</span>
                                                                            </span>
                                                                        )}
                                                                        {typeof p.defaultPrice === "number" && (
                                                                            <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5">
                                                                                ${p.defaultPrice.toFixed(2)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* “Checkbox” estilizado */}
                                                            <div className="ml-3 flex items-center">
                                                                <span
                                                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold transition ${isSelected
                                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                                        : "bg-white border-gray-300 text-transparent"
                                                                        }`}
                                                                >
                                                                    ✓
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === Sección: Límite de usos y estado === */}
                    <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Uso y estado
                            </h3>
                            <span className="text-xs text-gray-400">
                                Controla cuántas veces y si está disponible
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Límite de usos */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Límite de usos
                                </label>
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="usageLimitType"
                                            value="limited"
                                            checked={usageLimitType === "limited"}
                                            onChange={() => setUsageLimitType("limited")}
                                        />
                                        <span>Limitado</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="usageLimitType"
                                            value="unlimited"
                                            checked={usageLimitType === "unlimited"}
                                            onChange={() => setUsageLimitType("unlimited")}
                                        />
                                        <span>Ilimitado</span>
                                    </label>

                                    {usageLimitType === "limited" && (
                                        <>
                                            <input
                                                type="text"
                                                name="usageLimit"
                                                className="w-full md:w-40 border border-gray-300 rounded-lg  py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={usageLimit === null ? "" : String(usageLimit)}
                                                onChange={(e) => {
                                                    const raw = e.target.value;

                                                    // si lo borra, no marcamos error inmediato
                                                    if (raw === "") {
                                                        setUsageLimit(0);
                                                        return;
                                                    }

                                                    const num = Number(raw);
                                                    if (!Number.isNaN(num)) {
                                                        setUsageLimit(num);
                                                    }
                                                }}
                                            />
                                            <span>Usos</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Estado (activo/inactivo) */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Estado
                                </label>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    value={isActive ? "active" : "inactive"}
                                    onChange={(e) => setIsActive(e.target.value === "active")}
                                >
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-400">
                                    Solo los códigos activos se podrán aplicar en el checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2 bg-gray-50">
                    <button
                        className="px-4 py-2 text-xs md:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white bg-gray-100"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 text-xs md:text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear código"}
                    </button>
                </div>
            </div>
        </div>
    );
};
