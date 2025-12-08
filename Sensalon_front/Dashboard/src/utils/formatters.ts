export const formatValue = (val: any, fallback: string = "N/A") => {
    if (val === null || val === undefined || val === "null" || val === "") {
        return fallback;
    }
    return val;
};

export const formatStatus = (status: string | null, method?: string) => {
    if (!status || status === "null") {
        if (method === "MercadoPago") {
            return { text: "Error en proceso (MercadoPago)", color: "bg-red-200 text-red-800" };
        }
        return { text: "Sin confirmar", color: "bg-gray-200 text-gray-800" };
    }
    if (status === "approved") return { text: "Aprobado", color: "bg-green-100 text-green-800" };
    if (status === "pending") return { text: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Error", color: "bg-red-100 text-red-800" };
};

export const formatDate = (date: string | Date) => {
    // Normalizamos a string tipo "YYYY-MM-DD"
    const iso =
        date instanceof Date
            ? date.toISOString().split("T")[0]
            : (date || "").split("T")[0];

    const [year, month, day] = iso.split("-");
    if (!year || !month || !day) return "";

    return `${day}/${month}/${year}`; // dd/mm/yyyy
};