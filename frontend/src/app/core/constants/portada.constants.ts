/** Velocidad de lectura promedio para calcular los minutos de lectura. */
export const PALABRAS_POR_MINUTO = 200;

/** Una noticia oficial es «Última hora» durante estas horas después de publicada. */
export const HORAS_ULTIMA_HORA = 3;

/** Noticias que muestra cada columna de la portada al abrirla y que agrega cada clic en «Ver más». */
export const NOTICIAS_POR_TANDA = 6;

/** Noticias que van como publicación grande arriba del feed. */
export const NOTICIAS_DESTACADAS = 2;

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

/** Bloque azul de bienvenida, arriba de la portada. */
export const TEXTOS_BIENVENIDA = {
  tuMunicipio: 'tu municipio',
  nivel: 'nivel',
  publicar: 'Publicar',
} as const;

/** «Lo que pasa en Soacha, contado por sus vecinos.» o, sin municipio, «… en tu municipio …». */
export function titularBienvenida(municipio: string | null): string {
  return `Lo que pasa en ${municipio ?? TEXTOS_BIENVENIDA.tuMunicipio}, contado por sus vecinos.`;
}

/** Texto del campo que lleva a Publicar: «¿Qué está pasando en Fusagasugá?». */
export function preguntaPublicar(municipio: string | null): string {
  return `¿Qué está pasando en ${municipio ?? TEXTOS_BIENVENIDA.tuMunicipio}?`;
}

/** Columna derecha de la portada (escritorio y tableta). */
export const TEXTOS_COLUMNA = {
  etiqueta: 'Tu actividad',
  nivel: 'Nivel',
  puntos: 'puntos',
  verPerfil: 'Ver mi perfil',
  maximo: 'Estás en el nivel más alto.',
  ilimitado: 'Publicas sin límite diario.',
  avisos: 'Avisos cerca de ti',
  sinAvisos: 'No tienes avisos nuevos cerca de ti.',
  sinLeer: 'sin leer',
  alcaldia: 'De la alcaldía',
  sinAlcaldia: 'Todavía no hay noticias oficiales.',
  municipios: 'Municipios',
  noticias: 'noticias',
} as const;

/** Avisos de cercanía sin leer y noticias oficiales que se muestran en la columna. */
export const AVISOS_EN_COLUMNA = 2;
export const OFICIALES_EN_COLUMNA = 3;

/** «Faltan 90 puntos para el nivel 3.» */
export function textoFaltanPuntos(faltan: number, nivel: number): string {
  return `Faltan ${faltan} ${faltan === 1 ? 'punto' : 'puntos'} para el nivel ${nivel}.`;
}

/** «Publicas hasta 10 noticias al día.» */
export function textoLimiteDiario(limite: number): string {
  return `Publicas hasta ${limite} ${limite === 1 ? 'noticia' : 'noticias'} al día.`;
}

/** Texto de la barra de nivel para lectores de pantalla: «60 de 150 puntos para el nivel 3». */
export function textoBarraNivel(puntaje: number, meta: number, nivel: number): string {
  return `${puntaje} de ${meta} puntos para el nivel ${nivel}`;
}
