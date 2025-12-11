export const normalizeProducts = (raw: any, idx: number): any[] => {
    if (!raw) return [];

    // Caso 1: Buffer -> string
    if (Buffer.isBuffer(raw)) {
        raw = raw.toString("utf8");
    }

    // Caso 2: STRING (posible JSON, incluso doblemente codificado)
    if (typeof raw === "string") {
        try {
            let parsed: any = JSON.parse(raw);

            // 👇 Si después de parsear sigue siendo string, intentamos de nuevo
            if (typeof parsed === "string") {
                try {
                    const parsed2 = JSON.parse(parsed);
                    parsed = parsed2;
                } catch (e2) {
                    console.warn(
                        "[salesByMonth] string products doblemente codificado en idx:",
                        idx,
                        parsed
                    );
                }
            }

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (parsed && typeof parsed === "object") {
                if (Array.isArray((parsed as any).items)) return (parsed as any).items;
                if (Array.isArray((parsed as any).products)) return (parsed as any).products;
                if (Array.isArray((parsed as any).Productos)) return (parsed as any).Productos;
            }

            console.warn(
                "[salesByMonth] string products parseado pero sin array FINAL en idx:",
                idx,
                parsed
            );
            return [];
        } catch (e) {
            console.warn(
                "[salesByMonth] string products no se pudo parsear en idx:",
                idx,
                raw
            );
            return [];
        }
    }

    // Caso 3: ya es array
    if (Array.isArray(raw)) {
        return raw;
    }

    // Caso 4: objeto
    if (raw && typeof raw === "object") {
        if (Array.isArray((raw as any).items)) return (raw as any).items;
        if (Array.isArray((raw as any).products)) return (raw as any).products;
        if (Array.isArray((raw as any).Productos)) return (raw as any).Productos;

        // Ejemplo: { Producto: 'Pago de crédito...' } -> no hay lista de productos
        console.warn(
            "[salesByMonth] products objeto sin array en idx:",
            idx,
            raw
        );
        return [];
    }

    console.warn(
        "[salesByMonth] products con tipo no soportado en idx:",
        idx,
        typeof raw,
        raw
    );
    return [];
}
