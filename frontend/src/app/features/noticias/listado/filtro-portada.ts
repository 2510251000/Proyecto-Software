import { ETIQUETAS_NOTICIA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { esUltimaHora } from '../../../core/utils/noticia';

/** Lo que se está viendo en la portada según el chip elegido. */
export type FiltroPortada =
  | { tipo: 'todas' }
  | { tipo: 'ultima-hora' }
  | { tipo: 'oficiales' }
  | { tipo: 'comunidad' }
  | { tipo: 'ciudad'; ciudad: string };

export interface ChipFiltro {
  etiqueta: string;
  filtro: FiltroPortada;
}

export const FILTRO_INICIAL: FiltroPortada = { tipo: 'todas' };

/** Los chips que siempre aparecen; después van los de cada ciudad. */
export const CHIPS_FIJOS: readonly ChipFiltro[] = [
  { etiqueta: TEXTOS_PORTADA.todas, filtro: FILTRO_INICIAL },
  { etiqueta: ETIQUETAS_NOTICIA.ultimaHora, filtro: { tipo: 'ultima-hora' } },
  { etiqueta: TEXTOS_PORTADA.oficiales, filtro: { tipo: 'oficiales' } },
  { etiqueta: ETIQUETAS_NOTICIA.comunidad, filtro: { tipo: 'comunidad' } },
];

export function mismoFiltro(a: FiltroPortada, b: FiltroPortada): boolean {
  if (a.tipo === 'ciudad' && b.tipo === 'ciudad') {
    return a.ciudad === b.ciudad;
  }
  return a.tipo === b.tipo;
}

/** Filtra en el navegador, sin pedir nada nuevo al backend. Conserva el orden que llega. */
export function filtrarNoticias(
  noticias: readonly Noticia[],
  filtro: FiltroPortada,
  ahora = Date.now(),
): Noticia[] {
  switch (filtro.tipo) {
    case 'todas':
      return [...noticias];
    case 'ultima-hora':
      return noticias.filter((n) => esUltimaHora(n, ahora));
    case 'oficiales':
      return noticias.filter((n) => n.oficial);
    case 'comunidad':
      return noticias.filter((n) => !n.oficial);
    case 'ciudad':
      return noticias.filter((n) => n.ciudad === filtro.ciudad);
  }
}
