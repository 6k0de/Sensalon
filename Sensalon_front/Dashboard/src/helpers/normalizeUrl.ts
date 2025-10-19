export type NormalizeOpts = {
  /** Dominio destino deseado */
  defaultHost?: string; // p.ej. "api.sensalon.com.mx"
  /** Protocolo a usar en la salida */
  protocol?: 'https' | 'http' | ''; // '' => sin protocolo (protocol-relative: //host/...)
};

export const normalizeImageUrl = (
  input?: string | null,
  opts: NormalizeOpts = {}
): string => {
  const defaultHost = (opts.defaultHost ?? 'api.sensalon.com.mx').trim();
  const proto = opts.protocol ?? 'https';

  if (!input || typeof input !== 'string') return '';
  let raw = input.trim();
  if (!raw) return '';

  // Normaliza separadores
  raw = raw.replace(/\\/g, '/');

  // 1) Si ya es URL absoluta (http/https)
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      // Si el host ya es el correcto => regresa tal cual (o fuerza protocolo si se indicó)
      if (u.hostname === defaultHost) {
        if (proto === '' || u.protocol.replace(':', '') === proto) return u.toString();
        u.protocol = `${proto}:`;
        return u.toString();
      }
      // Si es otro host (CDN externo), lo dejamos intacto
      return raw;
    } catch {
      // si por alguna razón falla el parseo, seguimos con heurísticas abajo
    }
  }

  // 2) Si viene con ruta del server que incluye el dominio dentro
  //    Ej: "/var/www/.../api.sensalon.com.mx/assets/imagenes/xxx.jpg"
  const marker = `/${defaultHost}/`;
  const idx = raw.indexOf(marker);
  if (idx !== -1) {
    const path = raw.substring(idx + marker.length - 1); // conserva el slash de antes del dominio
    return build(`${path}`, defaultHost, proto);
  }

  // 3) Si empieza justo por el dominio sin protocolo
  //    Ej: "api.sensalon.com.mx/assets/imagenes/xxx.jpg"
  if (raw.startsWith(defaultHost + '/')) {
    return build('/' + raw.split(defaultHost)[1], defaultHost, proto);
  }

  // 4) Si solo trae la ruta de assets
  //    Ej: "/assets/imagenes/xxx.jpg" o "assets/imagenes/xxx.jpg"
  if (/^\/?assets\//i.test(raw)) {
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return build(path, defaultHost, proto);
  }

  // 5) Último recurso: si contiene "assets/..." en cualquier parte, lo recortamos desde ahí
  const assetsIdx = raw.toLowerCase().indexOf('assets/');
  if (assetsIdx !== -1) {
    const path = '/' + raw.substring(assetsIdx);
    return build(path, defaultHost, proto);
  }

  // 6) Si no pudimos reconocer el patrón, regresamos tal cual (o podrías decidir forzar dominio).
  return raw;
}

// Helper para construir la URL final
function build(path: string, host: string, proto: NormalizeOpts['protocol']) {
  // Evita dobles slashes
  const cleanPath = ('/' + path.replace(/^\/+/, '')).replace(/\/{2,}/g, '/');
  if (proto === '') return `//${host}${cleanPath}`;
  return `${proto}://${host}${cleanPath}`;
}
