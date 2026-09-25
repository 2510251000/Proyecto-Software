import { CategoriaMiniatura } from '../models/categoria-miniatura.model';

/**
 * Raíces de palabra que delatan la categoría de una noticia, sin tildes y en minúsculas.
 * Se revisan en este orden y gana la primera que aparezca en el titular.
 */
export const RAICES_POR_CATEGORIA: readonly (readonly [CategoriaMiniatura, readonly string[]])[] = [
  ['bici', ['ciclorruta', 'bici']],
  ['agua', ['agua', 'acueducto']],
  ['deporte', ['deport', 'futbol', 'natacion']],
  ['parque', ['parque', 'arbol']],
  ['comida', ['comida', 'feria', 'gastronom']],
  ['mercado', ['mercado', 'campesin']],
  ['obra', ['obra', 'colegio', 'construccion']],
];

export const CATEGORIA_POR_DEFECTO: CategoriaMiniatura = 'cultura';

/** Nombre de la sección que se muestra en el antetítulo de la nota principal. */
export const SECCION_POR_CATEGORIA: Readonly<Record<CategoriaMiniatura, string>> = {
  bici: 'Movilidad',
  agua: 'Servicios públicos',
  deporte: 'Deportes',
  parque: 'Medio ambiente',
  comida: 'Gastronomía',
  mercado: 'Economía',
  obra: 'Obras',
  cultura: 'Cultura',
};
