export const parseVariantColor = (variantcolor?: string) => {
    if (!variantcolor) return null;
    try {
        const parsed = JSON.parse(variantcolor);
        if (parsed?.name) {
            return {
                name: parsed.name,
                hex: parsed.hex || null,
            };
        }
    } catch {
        /* ignore */
    }
    return null;
};

export const formatColorName = (name?: string) =>
    name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : "";
