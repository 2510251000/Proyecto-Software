import { EstadoReporte, MotivoReporte } from '../models/interaccion.model';

/** Igual que COMENTARIO_LARGO_MAXIMO y REPORTE_LARGO_DESCRIPCION del backend. */
export const LARGO_MAXIMO_COMENTARIO = 1000;
export const LARGO_MAXIMO_DESCRIPCION_REPORTE = 1000;

/** Votar al autor desde su noticia: «sigue publicando así» o «no me gustó esto». */
export const TEXTOS_CALIFICACION = {
  pregunta: '¿Qué te parece lo que publica',
  autorGenerico: 'este autor',
  siguePublicando: 'Sigue publicando así',
  noMeGusto: 'No me gustó esto',
  aprobacion: 'de aprobación',
  voto: 'voto',
  votos: 'votos',
  sinVotos: 'Todavía nadie ha votado por este autor.',
  propia: 'Es tu noticia: los lectores votan por ti aquí.',
  gracias: 'Gracias, guardamos tu voto. Puedes cambiarlo cuando quieras.',
} as const;

/** «92 % de aprobación (25 votos)», o null si todavía no hay votos. */
export function textoAprobacion(aprobacion: number | null | undefined, votos: number | undefined): string | null {
  if (aprobacion === null || aprobacion === undefined || !votos) {
    return null;
  }
  const palabra = votos === 1 ? TEXTOS_CALIFICACION.voto : TEXTOS_CALIFICACION.votos;
  return `${aprobacion} % ${TEXTOS_CALIFICACION.aprobacion} (${votos} ${palabra})`;
}

export const TEXTOS_COMENTARIOS = {
  titulo: 'Comentarios',
  vacio: 'Todavía no hay comentarios. Sé el primero.',
  campo: 'Escribe un comentario',
  enviar: 'Comentar',
  borrar: 'Borrar',
  confirmarBorrado: '¿Borrar este comentario?',
  obligatorio: 'Escribe un comentario.',
  largo: `El comentario puede tener máximo ${LARGO_MAXIMO_COMENTARIO} caracteres.`,
  nivel: 'nivel',
} as const;

export const TEXTOS_REPORTE = {
  boton: 'Reportar',
  titulo: 'Reportar esta noticia',
  motivo: 'Motivo',
  descripcion: 'Cuéntanos más (opcional)',
  enviar: 'Enviar reporte',
  cancelar: 'Cancelar',
  gracias: 'Gracias. Un administrador va a revisar la noticia.',
  eligeMotivo: 'Elige un motivo.',
} as const;

export const ETIQUETAS_MOTIVO: Readonly<Record<MotivoReporte, string>> = {
  NOTICIA_FALSA: 'Es una noticia falsa',
  CONTENIDO_OFENSIVO: 'Tiene contenido ofensivo',
  SPAM: 'Es publicidad o spam',
  OTRO: 'Otro motivo',
};

export const MOTIVOS_REPORTE: readonly MotivoReporte[] = ['NOTICIA_FALSA', 'CONTENIDO_OFENSIVO', 'SPAM', 'OTRO'];

export const ETIQUETAS_ESTADO_REPORTE: Readonly<Record<EstadoReporte, string>> = {
  PENDIENTE: 'Pendiente',
  REVISADO: 'Revisado',
  DESCARTADO: 'Descartado',
};

export const ESTADOS_REPORTE: readonly EstadoReporte[] = ['PENDIENTE', 'REVISADO', 'DESCARTADO'];

export const TEXTOS_REPORTES_ADMIN = {
  pestana: 'Reportes',
  filtro: 'Estado',
  todos: 'Todos',
  vacio: 'No hay reportes con ese filtro.',
  por: 'Reportado por',
  revisado: 'Marcar revisado',
  descartado: 'Descartar',
  ocultarNoticia: 'Ocultar la noticia',
  verNoticia: 'Ver la noticia',
  noticiaOculta: 'La noticia ya está oculta',
} as const;
