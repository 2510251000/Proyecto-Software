import {
  CATEGORIA_POR_DEFECTO,
  RAICES_POR_CATEGORIA,
} from '../constants/categorias.constants';
import { CategoriaMiniatura } from '../models/categoria-miniatura.model';

/** Quita tildes y pasa a minúsculas: «Fútbol» → «futbol». */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Deduce la categoría de la miniatura a partir de las palabras del titular.
 * Solo cuenta si la raíz está al comienzo de una palabra: «obra» no coincide con «sobra».
 */
export function categoriaDeNoticia(titulo: string): CategoriaMiniatura {
  const palabras = normalizar(titulo).split(/[^a-z0-9]+/);
  const encontrada = RAICES_POR_CATEGORIA.find(([, raices]) =>
    palabras.some((palabra) => raices.some((raiz) => palabra.startsWith(raiz))),
  );
  return encontrada?.[0] ?? CATEGORIA_POR_DEFECTO;
}
