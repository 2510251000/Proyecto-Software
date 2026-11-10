import { Noticia, PestanaPortada } from '../../../core/models/noticia.model';
import { esUltimaHora } from '../../../core/utils/noticia';

/** Qué noticias se están viendo en la portada. */
export type FiltroPortada =
  | { tipo: 'todas' }
  | { tipo: 'ultima-hora' }
  | { tipo: 'oficiales' }
  | { tipo: 'comunidad' }
  | { tipo: 'ciudad'; ciudad: string };

export const FILTRO_INICIAL: FiltroPortada = { tipo: 'todas' };

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

/** Un municipio del selector de la portada con cuántas noticias tiene. */
export interface ConteoCiudad {
  ciudad: string;
  cantidad: number;
}

/**
 * Aplica la pestaña elegida. «Recomendadas» conserva el orden de la API; «Recientes» las
 * ordena aquí por fecha, de la más nueva a la más vieja, sin pedir nada al backend.
 */
export function aplicarPestana(noticias: readonly Noticia[], pestana: PestanaPortada): Noticia[] {
  switch (pestana) {
    case 'RECOMENDADAS':
      return [...noticias];
    case 'RECIENTES':
      return [...noticias].sort((a, b) => Date.parse(b.fechaPublicacion) - Date.parse(a.fechaPublicacion));
    case 'OFICIALES':
      return noticias.filter((n) => n.oficial);
    case 'COMUNITARIAS':
      return noticias.filter((n) => !n.oficial);
  }
}
