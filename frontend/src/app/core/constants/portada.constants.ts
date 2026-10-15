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
} as const;

/** Textos de la vista de una noticia: la vista rápida de la portada y su página propia. */
export const TEXTOS_NOTICIA = {
  cerrar: 'Cerrar noticia',
  abrirPagina: 'Abrir en página completa',
  volver: 'Volver a la portada',
  noEncontrada: 'No encontramos esta noticia',
  noEncontradaAyuda: 'Puede que ya no esté publicada o que el enlace esté incompleto.',
} as const;

export const TEXTOS_PORTADA = {
  tuRegion: 'Tu región',
  elegirMunicipio: 'Elegir municipio',
  todas: 'Todos',
  cerrarSesion: 'Cerrar sesión',
  oficiales: 'Información oficial',
  oficialesDescripcion: 'Publicada por los administradores del portal.',
  comunidad: 'Lo que cuenta la comunidad',
  comunidadDescripcion: 'Escrita por los vecinos de cada municipio.',
  sinOficiales: 'Todavía no hay información oficial de este municipio.',
  sinComunidad: 'Nadie de este municipio ha contado nada todavía.',
  verMas: 'Ver más noticias',
  noticia: 'noticia',
  noticias: 'noticias',
  sinNoticias: 'Todavía no hay noticias publicadas.',
  actualizar: 'Actualizar',
  reintentar: 'Reintentar',
} as const;
