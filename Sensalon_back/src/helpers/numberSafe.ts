export const toNumberSafe = (value: any): number | null => {
    if (value == null) return null;

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
        // Limpia símbolos que no sean dígitos, puntos o comas
        const cleaned = value
        
            .trim()
            .replace(/[^0-9,.-]/g, "") // quita $, MXN, espacios, etc.
            .replace(",", ".");        // convierte 1650,50 -> 1650.50

        const n = Number(cleaned);
        return Number.isFinite(n) ? n : null;
    }

    return null;
};
