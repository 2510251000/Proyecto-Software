/** Un pedazo de un párrafo: texto normal o una dirección web que se muestra como enlace. */
export interface TrozoTexto {
  texto: string;
  enlace: boolean;
}

/** Direcciones http(s) dentro de un texto; el punto o la coma final no hacen parte de la dirección. */
const DIRECCION_WEB = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)»]/g;

/**
 * Parte un párrafo en texto y enlaces, para citar la fuente de una noticia con su link.
 * Solo se reconocen direcciones http y https: nunca «javascript:» ni HTML.
 */
export function trozosConEnlaces(parrafo: string): TrozoTexto[] {
  const trozos: TrozoTexto[] = [];
  let desde = 0;
  for (const encontrada of parrafo.matchAll(DIRECCION_WEB)) {
    const inicio = encontrada.index;
    if (inicio > desde) {
      trozos.push({ texto: parrafo.slice(desde, inicio), enlace: false });
    }
    trozos.push({ texto: encontrada[0], enlace: true });
    desde = inicio + encontrada[0].length;
  }
  if (desde < parrafo.length) {
    trozos.push({ texto: parrafo.slice(desde), enlace: false });
  }
  return trozos;
}

/** Iniciales para el chip del autor: «Laura Méndez» → «LM». */
export function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}
