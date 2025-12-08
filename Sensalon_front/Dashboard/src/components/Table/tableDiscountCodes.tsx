import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { DiscountCode } from "../../interfaces/discounts";

interface Props {
    codes: DiscountCode[];
    isLoading: boolean;
    onEdit: (code: DiscountCode) => void;
    onDelete: (code: DiscountCode) => void;
    formatScope: (code: DiscountCode) => string;
    formatUsage: (code: DiscountCode) => string;
}

const formatValue = (code: DiscountCode) => {
    if (code.discountType === "PERCENT") {
        return `${code.value}%`;
    }
    const amount = Number(code.value ?? 0);
    return `$${amount.toFixed(2)}`;
};

export const TableDiscountCodes: React.FC<Props> = ({
    codes,
    isLoading,
    onEdit,
    onDelete,
    formatScope,
    formatUsage,
}) => {
    if (isLoading) {
        return <div className="py-10 text-center text-gray-500">Cargando...</div>;
    }

    if (!codes || codes.length === 0) {
        return (
            <div className="py-10 text-center text-gray-500">
                No hay códigos de descuento registrados.
            </div>
        );
    }

    return (
        <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg h-auto custom-scrollbar">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-sm text-[#393936] bg-[#f7f7f6]">
                    <tr>
                        <th className="px-6 py-3">Código</th>
                        <th className="px-6 py-3">Descuento</th>
                        <th className="px-6 py-3">Alcance</th>
                        <th className="px-6 py-3">Límite de uso</th>
                        <th className="px-6 py-3">Estado</th>
                        <th className="px-6 py-3">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {codes.map((code) => (
                        <tr key={code.id} className="bg-white border-b">
                            <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                {code.code}
                            </td>
                            <td className="px-6 py-2">{formatValue(code)}</td>
                            <td className="px-6 py-2">{formatScope(code)}</td>
                            <td className="px-6 py-2">{formatUsage(code)}</td>
                            <td className="px-6 py-2">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${code.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {code.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td className="px-6 py-2">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onEdit(code)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(code)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
