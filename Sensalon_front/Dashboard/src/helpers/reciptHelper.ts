export const guessTypeFromName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lower)) return "image";
  return "unknown";
};

export const normalizeReceiptUrl = (base: string, rawPath: string) => {
  // `rawPath` puede venir como "/assets/comprobantetransf/file.jpg"
  // o con ruta absoluta de servidor. Solo necesitamos el filename.
  const fileName = rawPath.split("/").pop() ?? rawPath;
  return `${base.replace(/\/+$/,"")}/${encodeURIComponent(fileName)}`;
};