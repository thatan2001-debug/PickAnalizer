/**
 * Convierte un nombre de página en una ruta amigable para URL.
 * - Recorta espacios en extremos.
 * - Normaliza múltiples espacios.
 * - Reemplaza espacios por guiones.
 * - Convierte el texto a minúsculas.
 */
export function createPageUrl(pageName: string): string {
  const slug = pageName
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ /g, '-')
    .toLowerCase();

  return `/${slug}`;
}
