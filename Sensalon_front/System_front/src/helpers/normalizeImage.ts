export const normalizeImageUrl = (input?: string | null): string => {
    if (!input) return "/placeholder.png";

    // uniformar separadores
    const raw = String(input).replace(/\\/g, "/").trim();

    // si ya es http(s), la regresamos tal cual
    if (/^https?:\/\//i.test(raw)) return raw;

    const HOST = "api.sensalon.com.mx";

    // si la ruta contiene .../api.sensalon.com.mx/...
    const idx = raw.indexOf(HOST);
    if (idx !== -1) {
        const tail = raw.slice(idx + HOST.length);
        return `https://${HOST}${tail.startsWith("/") ? tail : `/${tail}`}`;
    }

    // si ya viene como ruta del api (ej. /assets/imagenes/xxx.jpg)
    if (raw.startsWith("/assets/")) {
        return `https://${HOST}${raw}`;
    }

    // si viene una ruta absoluta de servidor con /imagenes/ al final
    const imgIdx = raw.indexOf("/assets/imagenes/");
    if (imgIdx !== -1) {
        const tail = raw.slice(imgIdx); // incluye /assets/imagenes/...
        return `https://${HOST}${tail}`;
    }

    // último recurso: intentar pegar directo al host
    return `https://${HOST}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
