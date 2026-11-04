import {
  HISTORIAS_DE_RESPALDO,
  HORAS_SALUDO,
  MAXIMO_HISTORIAS,
  NOTICIAS_CERCA_DE_TI,
  SALUDOS,
} from '../../core/constants/hoy.constants';
import { Noticia } from '../../core/models/noticia.model';

/** Historias que se muestran y si de verdad son de hoy o son el respaldo. */
export interface SeleccionHistorias {
  historias: Noticia[];
  sonDeHoy: boolean;
}

/** true si las dos fechas caen el mismo día en la hora local del navegador. */
export function mismoDiaLocal(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function porFechaDescendente(a: Noticia, b: Noticia): number {
  return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
}

/**
 * Las noticias de hoy (como máximo MAXIMO_HISTORIAS), de la más reciente a la más antigua.
 * Si hoy no hay ninguna, las HISTORIAS_DE_RESPALDO más recientes.
 */
export function seleccionarHistorias(noticias: readonly Noticia[], ahora = new Date()): SeleccionHistorias {
  const ordenadas = [...noticias].sort(porFechaDescendente);
  const deHoy = ordenadas.filter((n) => mismoDiaLocal(new Date(n.fechaPublicacion), ahora));
  if (deHoy.length > 0) {
    return { historias: deHoy.slice(0, MAXIMO_HISTORIAS), sonDeHoy: true };
  }
  return { historias: ordenadas.slice(0, HISTORIAS_DE_RESPALDO), sonDeHoy: false };
}

/**
 * «Cerca de ti»: las más recientes de otros municipios. Si el usuario no tiene ciudad
 * (ciudadId null), las más recientes que no salieron en las historias.
 */
export function cercaDeTi(
  todas: readonly Noticia[],
  ciudadId: number | null,
  yaMostradas: readonly Noticia[],
): Noticia[] {
  const mostradas = new Set(yaMostradas.map((n) => n.id));
  return [...todas]
    .sort(porFechaDescendente)
    .filter((n) => !mostradas.has(n.id) && (ciudadId === null || n.ciudadId !== ciudadId))
    .slice(0, NOTICIAS_CERCA_DE_TI);
}

/** «Buenos días» de 5:00 a 11:59, «Buenas tardes» de 12:00 a 18:59 y «Buenas noches» el resto. */
export function saludoSegunHora(fecha: Date): string {
  const hora = fecha.getHours();
  if (hora >= HORAS_SALUDO.manana && hora < HORAS_SALUDO.tarde) {
    return SALUDOS.manana;
  }
  if (hora >= HORAS_SALUDO.tarde && hora < HORAS_SALUDO.noche) {
    return SALUDOS.tarde;
  }
  return SALUDOS.noche;
}

/** «Buenos días, Laura», o solo el saludo si no hay nombre. Usa el primer nombre. */
export function saludoCompleto(fecha: Date, nombre: string | null): string {
  const saludo = saludoSegunHora(fecha);
  const primerNombre = nombre?.trim().split(/\s+/)[0];
  return primerNombre ? `${saludo}, ${primerNombre}` : saludo;
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
