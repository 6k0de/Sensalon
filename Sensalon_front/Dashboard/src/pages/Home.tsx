import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/axiosClients";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);

type SalesMonth = {
    month?: string;
    monthLabel?: string;
    monthKey?: string;
    monthNum?: number;
    total: number;
};
type TopCustomer = {
    userId: string;
    vcfirstname?: string;
    vclastname?: string;
    vcemail?: string;
    totalSpent: number;
    orders: number;
};
type InventoryProduct = {
    productId: string;
    productName: string;
    stock: number;
    unitPrice: number;
    totalValue: number;
};

type InventoryBrand = {
    companyId: string;
    companyName: string;
    stockTotal: number;
    productsCount: number;
    inventoryValue: number;
    products: InventoryProduct[];
};

type CompanyOption = {
    iIdCompany: string;
    vcname: string;
};
type CategoryOption = {
    iIdCategory: string;
    vcname: string;
};

export const Home = () => {
    const [salesMonth, setSalesMonth] = useState<SalesMonth[]>([]);
    const [topCustomer, setTopCustomer] = useState<TopCustomer[]>([]);
    const [inventory, setInventory] = useState<InventoryBrand[]>([]);
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [filterBrand, setFilterBrand] = useState<string>("");
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterDistributor, setFilterDistributor] = useState<boolean>(false);
    const [selectedBrandId, setSelectedBrandId] = useState<string>("");

    const randomColor = () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 0.7)`;

    // 1) Cargar datos que NO dependen del año (solo una vez)
    useEffect(() => {
        const loadStaticData = async () => {
            try {
                const [topRes, invRes, compsRes, catsRes] = await Promise.all([
                    api.get("/stats/top-customer"),          // ← aquí llega tu array de 10 clientes
                    api.get("/stats/inventory-by-brand"),
                    api.get("/empresas"),
                    api.get("/categorias"),
                ]);

                const topData = (topRes.data.data || []) as any[];

                setTopCustomer(
                    topData.map((t) => ({
                        ...t,
                        totalSpent: Number(t.totalSpent ?? 0), // normalizamos a número
                    }))
                );

                setInventory(
                    (invRes.data.data || []).map((b: any) => ({
                        ...b,
                        stockTotal: Number(b.stockTotal ?? 0),
                        productsCount: Number(b.productsCount ?? 0),
                        inventoryValue: Number(b.inventoryValue ?? 0),
                        products: (b.products || []).map((p: any) => ({
                            ...p,
                            stock: Number(p.stock ?? 0),
                            unitPrice: Number(p.unitPrice ?? 0),
                            totalValue: Number(p.totalValue ?? 0),
                        })),
                    }))
                );
                setCompanies(compsRes.data || []);
                setCategories(catsRes.data || []);
            } catch (e) {
                console.error("Error cargando datos estáticos del dashboard:", e);
            }
        };

        loadStaticData();
    }, []);

    const selectedBrand =
        inventory.find((b) => b.companyId === selectedBrandId) || inventory[0];

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBrandId(e.target.value);
    };
    // 2) Cargar SOLO ventas por mes cuando cambia el año
    useEffect(() => {
        const loadSalesByMonth = async () => {
            try {
                const params = new URLSearchParams();
                params.set("year", String(selectedYear));
                if (filterBrand) params.set("brandId", filterBrand);
                if (filterCategory) params.set("categoryId", filterCategory);
                if (filterDistributor) params.set("distributor", "1");

                const m = await api.get(`/stats/sales-by-month?${params.toString()}`);
                setSalesMonth(m.data.data || []);
            } catch (e) {
                console.error("Error cargando ventas por mes:", e);
                setSalesMonth([]);
            }
        };

        loadSalesByMonth();
    }, [selectedYear, filterBrand, filterCategory, filterDistributor]);

    console.log(salesMonth)

    const monthlyWithLabel = useMemo(
        () =>
            salesMonth.map((m) => ({
                ...m,
                label: m.monthLabel || m.month || m.monthKey || "",
            })),
        [salesMonth]
    );

    const colors = monthlyWithLabel.map(() => randomColor());

    const lineData = useMemo(
        () => ({
            labels: monthlyWithLabel.map((m) => m.monthLabel || m.label),
            datasets: [
                {
                    label: "Ventas por mes",
                    data: monthlyWithLabel.map((m) => Number(m.total || 0)),
                    backgroundColor: colors,
                    borderRadius: 6,
                },
            ],
        }),
        [monthlyWithLabel, colors]
    );

    const lineOptions = useMemo(
        () => ({
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => {
                            const raw = Number(ctx.raw ?? 0);
                            return `$ ${raw.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: any) =>
                            `$ ${Number(value).toLocaleString("es-MX")}`,
                    },
                },
            },
        }),
        []
    );

    const inventoryValueData = useMemo(() => {
        const colors = inventory.map(
            (_, i) => `hsl(${(i * 60) % 360}, 60%, 55%)`
        );

        return {
            labels: inventory.map((b) => b.companyName || "Sin marca"),
            datasets: [
                {
                    label: "Valor del inventario ($)",
                    data: inventory.map((b) => b.inventoryValue),
                    backgroundColor: colors,
                    borderRadius: 6,
                },
            ],
        };
    }, [inventory]);


    const exportVentasMesExcel = () => {
        if (!monthlyWithLabel.length) return;

        // 1) Preparar datos
        const rows = monthlyWithLabel.map((m) => ({
            Mes: m.monthLabel || m.label || "",
            Total: Number(m.total ?? 0),
        }));

        // 2) Crear hoja
        const sheet = XLSX.utils.json_to_sheet(rows, {
            header: ["Mes", "Total"],
        });

        // 3) Ajustar ancho de columnas
        sheet["!cols"] = [
            { wch: 20 }, // Mes
            { wch: 18 }, // Total
        ];

        // 4) Crear libro
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Ventas por mes");

        // 5) Exportar
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `ventas_por_mes_${selectedYear}.xlsx`);
    };


    const exportInventoryToExcel = () => {
        if (!inventory.length) return;

        // ========== HOJA 1: RESUMEN POR MARCA ==========
        const resumenRows = inventory.map((b) => ({
            Marca: b.companyName,
            Productos: b.productsCount,
            "Stock total": b.stockTotal,
            "Valor total ($)": Number(b.inventoryValue ?? 0),
        }));

        const resumenSheet = XLSX.utils.json_to_sheet(resumenRows, {
            header: ["Marca", "Productos", "Stock total", "Valor total ($)"],
        });

        // Ajustar ancho de columnas (wch = width in characters)
        resumenSheet["!cols"] = [
            { wch: 30 }, // Marca
            { wch: 12 }, // Productos
            { wch: 14 }, // Stock total
            { wch: 18 }, // Valor total ($)
        ];

        // ========== HOJA 2: DETALLE POR PRODUCTO ==========
        const detalleRows = inventory.flatMap((b) =>
            b.products.map((p) => ({
                Marca: b.companyName,
                Producto: p.productName,
                Stock: p.stock,
                "Valor total ($)": Number(p.totalValue ?? 0),
            }))
        );

        const detalleSheet = XLSX.utils.json_to_sheet(detalleRows, {
            header: [
                "Marca",
                "Producto",
                "Stock",
                "Valor total ($)",
            ],
        });

        detalleSheet["!cols"] = [
            { wch: 30 }, // Marca
            { wch: 40 }, // Producto
            { wch: 10 }, // Stock
            { wch: 20 }, // Valor total ($)
        ];

        // ========== CREAR LIBRO Y EXPORTAR ==========
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, resumenSheet, "Resumen marcas");
        XLSX.utils.book_append_sheet(wb, detalleSheet, "Detalle productos");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const fecha = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        saveAs(blob, `inventario_marcas_${fecha}.xlsx`);
    };




    return (
        <div className="py-12 px-5 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#1d1d1b]">Dashboard</h1>
                <p className="text-sm text-gray-500">Resumen general del sistema</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 📊 Ventas por mes (con filtro de año dentro de la card) */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Ventas por mes $
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <button
                                onClick={exportVentasMesExcel}
                                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 text-[11px]"
                            >
                                Exportar excel
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-xs text-gray-700">
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px]">Año</span>
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(Number(e.target.value))
                                }
                                className="border border-gray-300 rounded-lg px-2 py-2 text-xs"
                            >
                                {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4].map(
                                    (y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px]">Marca/Empresa</span>
                            <select
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 text-xs"
                            >
                                <option value="">Todas</option>
                                {companies.map((c) => (
                                    <option key={c.iIdCompany} value={c.iIdCompany}>
                                        {c.vcname}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px]">Categoría</span>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 text-xs"
                            >
                                <option value="">Todas</option>
                                {categories.map((c) => (
                                    <option key={c.iIdCategory} value={c.iIdCategory}>
                                        {c.vcname}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 mt-4">
                            <input
                                type="checkbox"
                                checked={filterDistributor}
                                onChange={(e) => setFilterDistributor(e.target.checked)}
                            />
                            <span>Solo distribuidores</span>
                        </label>
                    </div>
                    {monthlyWithLabel.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            Sin datos para {selectedYear}
                        </p>
                    ) : (
                        <Bar data={lineData} options={lineOptions} />
                    )}
                </div>

                {/* ⭐ Top cliente */}
                {/* ⭐ Top clientes */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Clientes con mas compras
                        </h3>
                    </div>

                    {topCustomer.length === 0 ? (
                        <p className="text-gray-500 text-sm">Sin datos</p>
                    ) : (
                        <div className="space-y-2 shadow-sm max-h-[370px] overflow-y-auto">
                            {topCustomer.map((c, index) => (
                                <div
                                    key={c.userId}
                                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* medalla / número de ranking */}
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-semibold text-indigo-700">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                {c.vcfirstname} {c.vclastname}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                                {c.vcemail}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800">
                                            $
                                            {Number(c.totalSpent ?? 0).toLocaleString("es-MX", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {c.orders} orden{c.orders === 1 ? "" : "es"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                {/* 📦 Inventario por marcas y productos */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Inventario por marcas
                        </h3>
                        <button
                            onClick={exportInventoryToExcel}
                            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 text-[11px] text-gray-700"
                        >
                            Exportar a Excel
                        </button>
                    </div>

                    {inventory.length === 0 ? (
                        <p className="text-gray-500 text-sm">Sin datos</p>
                    ) : (
                        <>
                            {/* Gráfica de valor por marca */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Valor total del inventario por marca
                                </p>
                                <Bar
                                    data={inventoryValueData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                callbacks: {
                                                    label: (ctx: any) =>
                                                        `$ ${Number(ctx.raw || 0).toLocaleString("es-MX", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`,
                                                },
                                            },
                                        },
                                        indexAxis: "y" as const,
                                    }}
                                />
                            </div>

                            {/* Selector de marca */}
                            <div className="flex items-center justify-between mb-3 gap-3">
                                <div className="flex flex-col text-xs">
                                    <span className="text-[11px] text-gray-500 mb-1">
                                        Marca seleccionada
                                    </span>
                                    <select
                                        value={selectedBrand?.companyId || ""}
                                        onChange={handleBrandChange}
                                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                                    >
                                        {inventory.map((b) => (
                                            <option key={b.companyId} value={b.companyId}>
                                                {b.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBrand && (
                                    <div className="text-right text-xs text-gray-600">
                                        <p>
                                            <span className="font-semibold">
                                                {selectedBrand.productsCount}
                                            </span>{" "}
                                            productos
                                        </p>
                                        <p>
                                            Stock total:{" "}
                                            <span className="font-semibold">
                                                {selectedBrand.stockTotal}
                                            </span>
                                        </p>
                                        <p>
                                            Valor total:{" "}
                                            <span className="font-semibold">
                                                $
                                                {selectedBrand.inventoryValue.toLocaleString("es-MX", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Tabla de productos de la marca seleccionada */}
                            {selectedBrand && (
                                <div className="overflow-x-auto max-h-72">
                                    <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Producto</th>
                                                <th className="px-3 py-2 text-right">Stock</th>
                                                <th className="px-3 py-2 text-right">Precio</th>
                                                <th className="px-3 py-2 text-right">Valor total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBrand.products.map((p) => (
                                                <tr
                                                    key={p.productId}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-2 font-medium text-gray-800">
                                                        {p.productName}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {p.stock}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        $
                                                        {p.unitPrice.toLocaleString("es-MX", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold">
                                                        $
                                                        {p.totalValue.toLocaleString("es-MX", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
