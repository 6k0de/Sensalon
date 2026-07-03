export const normalizeImageUrl = (input?: string | null): string => {
    if (!input) return "/placeholder.png";

    // uniformar separadores
    const raw = String(input).replace(/\\/g, "/").trim();

    // si ya es http(s), la regresamos tal cual
    if (/^https?:\/\//i.test(raw)) return raw;

    const HOST = "localhost:3000";

    // si la ruta contiene .../localhost:3000/...
    const idx = raw.indexOf(HOST);
    if (idx !== -1) {
        const tail = raw.slice(idx + HOST.length);
        return `http://${HOST}${tail.startsWith("/") ? tail : `/${tail}`}`;
    }

    // si ya viene como ruta del api (ej. /assets/imagenes/xxx.jpg)
    if (raw.startsWith("/assets/")) {
        return `http://${HOST}${raw}`;
    }

    // si viene una ruta absoluta de servidor con /imagenes/ al final
    const imgIdx = raw.indexOf("/assets/imagenes/");
    if (imgIdx !== -1) {
        const tail = raw.slice(imgIdx); // incluye /assets/imagenes/...
        return `http://${HOST}${tail}`;
    }

    // último recurso: intentar pegar directo al host
    return `http://${HOST}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
