/** Máximo de historias que muestra «Hoy». */
export const MAXIMO_HISTORIAS = 10;

/** Si hoy no hay noticias del municipio, se muestran estas más recientes. */
export const HISTORIAS_DE_RESPALDO = 5;

/** Noticias de otros municipios en la tarjeta final («Cerca de ti»). */
export const NOTICIAS_CERCA_DE_TI = 3;

/** Porcentaje del ancho de la historia (desde la izquierda) que lleva a la anterior. */
export const PORCENTAJE_ZONA_ANTERIOR = 35;

/** Hora (0-23) en que empieza cada saludo. Antes de la mañana sigue siendo de noche. */
export const HORAS_SALUDO = {
  manana: 5,
  tarde: 12,
  noche: 19,
} as const;

export const SALUDOS = {
  manana: 'Buenos días',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
} as const;

export const TEXTOS_HOY = {
  cargando: 'Preparando tus noticias de hoy…',
  subtituloHoy: 'Estas son las noticias más recientes de hoy',
  subtituloRespaldo: 'No hay noticias de hoy. Estas son las más recientes',
  subtituloVacio: 'Todavía no hay noticias publicadas',
  empezar: 'Ver las noticias',
  hoyEnTuMunicipio: 'Hoy en tu municipio',
  titulares: 'Titulares de hoy',
  sigue: 'Sigue',
  oficial: 'Oficial',
  comunidad: 'Comunidad',
  nivel: 'Nivel',
  autorDesconocido: 'Al Día',
  leerCompleta: 'Leer la noticia completa',
  anterior: 'Historia anterior',
  siguiente: 'Historia siguiente',
  pausar: 'Pausar',
  reanudar: 'Reanudar',
  enPausa: 'En pausa',
  cerrar: 'Cerrar y volver a la portada',
  historia: 'Historia',
  de: 'de',
  progreso: 'Progreso de las historias',
  yaEstasAlDia: 'Ya estás al día',
  en: 'en',
  cercaDeTi: 'Cerca de ti',
  verOtraVez: 'Ver otra vez',
  irAPortada: 'Ir a la portada',
  reintentar: 'Ir a la portada',
} as const;
