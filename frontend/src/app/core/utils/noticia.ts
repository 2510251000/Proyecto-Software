import { HORAS_ULTIMA_HORA, PALABRAS_POR_MINUTO } from '../constants/portada.constants';
import { IDIOMA } from '../constants/regional.constants';
import { Noticia } from '../models/noticia.model';

const MS_POR_MINUTO = 60_000;
const MINUTOS_POR_HORA = 60;
const MINUTOS_POR_DIA = 1440;

const FORMATO_RELATIVO = new Intl.RelativeTimeFormat(IDIOMA, { numeric: 'auto' });

/** Palabras del contenido ÷ 200, redondeado hacia arriba, mínimo 1. */
export function minutosDeLectura(contenido: string): number {
  const palabras = contenido.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}

/** «hace 5 minutos», «hace 2 horas», «ayer»… Cadena vacía si la fecha no es válida. */
export function tiempoRelativo(fechaIso: string, ahora = Date.now()): string {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return '';
  }
  const minutos = Math.round((fecha.getTime() - ahora) / MS_POR_MINUTO);
  if (Math.abs(minutos) < MINUTOS_POR_HORA) {
    return FORMATO_RELATIVO.format(minutos, 'minute');
  }
  if (Math.abs(minutos) < MINUTOS_POR_DIA) {
    return FORMATO_RELATIVO.format(Math.round(minutos / MINUTOS_POR_HORA), 'hour');
  }
  return FORMATO_RELATIVO.format(Math.round(minutos / MINUTOS_POR_DIA), 'day');
}

/** Oficial y publicada hace menos de tres horas. */
export function esUltimaHora(noticia: Noticia, ahora = Date.now()): boolean {
  const publicada = new Date(noticia.fechaPublicacion).getTime();
  if (!noticia.oficial || Number.isNaN(publicada)) {
    return false;
  }
  return ahora - publicada < HORAS_ULTIMA_HORA * MINUTOS_POR_HORA * MS_POR_MINUTO;
}
