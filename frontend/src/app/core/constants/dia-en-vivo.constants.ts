/**
 * Portada «El día en vivo». Las horas se manejan como número decimal: 5:40 p. m. = 17.67.
 * En Colombia el sol sale y se pone cerca de las 6 todo el año, por eso el arco es fijo.
 */
export const HORAS_DEL_DIA = {
  /** Sale el sol: empieza el arco y el momento «amanecer». */
  amanecer: 6,
  /** Empieza el momento «día». */
  dia: 7.5,
  /** Empieza el momento «atardecer». */
  atardecer: 16,
  /** Empieza el momento «noche» y, con él, el tema de noche. */
  noche: 17.5,
  /** Se pone el sol: termina el arco. */
  ocaso: 18,
} as const;

export const MINUTOS_POR_HORA = 60;

/** Margen al comparar horas decimales, para que 16.33 y 16.330001 cuenten como la misma. */
export const TOLERANCIA_HORA = 0.001;

/** Medidas de la línea del sol: x en % del ancho de la franja; y en px desde arriba. */
export const ARCO = {
  /** Dónde queda las 6 a. m. */
  xInicio: 8,
  /** Ancho del arco: las 6 p. m. quedan en xInicio + ancho. */
  ancho: 84,
  /** Punto más alto del arco (el mediodía). */
  tope: 30,
  /** Del punto más alto al horizonte. */
  alto: 170,
} as const;

/** Noticias con marca en el arco: como mucho estas, las más recientes del día. */
export const MARCAS_MAXIMAS = 8;

/** Dos marcas a menos de este % del ancho se pisan: queda solo la más reciente. */
export const SEPARACION_MINIMA_MARCAS = 3;

/** Ficha «Dónde está pasando». */
export const MAPA_MOSAICO = {
  /** Municipios que se dibujan como punto: los que tienen más noticias. */
  municipios: 6,
  /** Margen del área de los puntos, en %. */
  margen: 14,
  /** Posición de un punto cuando no hay con qué compararlo (un solo municipio). */
  centro: 50,
  /** Desde este % del ancho el nombre va a la izquierda del punto. */
  nombreALaIzquierdaDesde: 60,
  /** Diámetro del punto, en px, con 1, 2 y 3 o más noticias. */
  tamanoPunto: [10, 14, 20],
} as const;

/** «a. m.» y «p. m.» de una hora legible: «4:20 p. m.». */
export const SUFIJOS_HORA = {
  manana: 'a. m.',
  tarde: 'p. m.',
} as const;

/** Portada de cine: la noticia del momento a pantalla completa. */
export const TEXTOS_CINE = {
  leer: 'Leer la noticia',
  verEnMapa: 'Ver en el mapa',
} as const;
