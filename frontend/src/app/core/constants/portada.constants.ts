/** Velocidad de lectura promedio para calcular los minutos de lectura. */
export const PALABRAS_POR_MINUTO = 200;

/** Una noticia oficial es «Última hora» durante estas horas después de publicada. */
export const HORAS_ULTIMA_HORA = 3;

/** Noticias que muestra cada columna de la portada al abrirla y que agrega cada clic en «Ver más». */
export const NOTICIAS_POR_TANDA = 6;

export const ETIQUETAS_NOTICIA = {
  ultimaHora: 'Última hora',
  oficial: 'Oficial',
  comunidad: 'Comunidad',
  minutos: 'min',
  deLectura: 'de lectura',
  por: 'Por',
  nivel: 'nivel',
  etiquetaNivel: 'Nivel',
  /** Nombre que se muestra si la API no trae el autor. */
  autorOficial: 'Administración municipal',
  autorComunidad: 'Vecino de la comunidad',
  aprobacionAutor: 'Lectores que quieren que el autor siga publicando así'
} as const;

/** Textos de la vista de una noticia: la vista rápida de la portada y su página propia. */
export const TEXTOS_NOTICIA = {
  cerrar: 'Cerrar noticia',
  abrirPagina: 'Abrir en página completa',
  volver: 'Volver a la portada',
  noEncontrada: 'No encontramos esta noticia',
  noEncontradaAyuda: 'Puede que ya no esté publicada o que el enlace esté incompleto.',
  galeria: 'Más fotos de la noticia',
} as const;

export const TEXTOS_PORTADA = {
  tuRegion: 'Tu región',
  verMas: 'Ver más noticias',
  destacadas: 'Nuevas y recomendadas',
  masDeTuRegion: 'Más de tu región',
  sinFiltro: 'No hay noticias para lo que elegiste. Prueba con otra pestaña o con otro municipio.',
  sinNoticias: 'Todavía no hay noticias publicadas.',
  sinResultados: 'No encontramos noticias con esa búsqueda.',
  actualizar: 'Actualizar',
  reintentar: 'Reintentar',
} as const;

/** Fichas «Tu nivel» y «Avisos cerca de ti» del mosaico de la portada. */
export const TEXTOS_COLUMNA = {
  nivel: 'Nivel',
  ilimitado: 'Publicas sin límite diario.',
  avisos: 'Avisos cerca de ti',
  sinAvisos: 'No tienes avisos nuevos cerca de ti.',
  sinLeer: 'sin leer',
} as const;

/** Avisos de cercanía sin leer que se muestran en la ficha. */
export const AVISOS_EN_COLUMNA = 2;

/** Texto de la barra de nivel para lectores de pantalla: «60 de 150 puntos para el nivel 3». */
export function textoBarraNivel(puntaje: number, meta: number, nivel: number): string {
  return `${puntaje} de ${meta} puntos para el nivel ${nivel}`;
}
