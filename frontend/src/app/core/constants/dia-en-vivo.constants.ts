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
  /** Diámetro del botón redondo del deslizador, en px: su centro queda justo debajo del sol. */
  botonRango: 24,
} as const;

/** Horas de guía que se escriben bajo el arco. */
export const GUIAS_ARCO = [
  { hora: 6, texto: '6 a. m.' },
  { hora: 9, texto: '9 a. m.' },
  { hora: 12, texto: '12 m.' },
  { hora: 15, texto: '3 p. m.' },
  { hora: 18, texto: '6 p. m.' },
] as const;

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

/** Línea del sol: el arco con las noticias del día y el deslizador. */
export const TEXTOS_LINEA_SOL = {
  deslizador: 'Hora del día que quieres ver',
} as const;

/** Nombre accesible de una marca del arco: «Ir a las 10:30 a. m.: {titular}». */
export function etiquetaMarca(hora: string, titular: string): string {
  return `Ir a las ${hora}: ${titular}`;
}

/** Lo que se anuncia al soltar el deslizador: «10:30 a. m.: {titular}». */
export function anuncioHora(hora: string, titular: string): string {
  return `${hora}: ${titular}`;
}

/** Tarjeta del reloj de la portada de cine. */
export const TEXTOS_RELOJ = {
  etiqueta: 'Hora que estás viendo',
  ahora: 'Ahora',
  viendo: 'Estás viendo las',
  ayuda: 'Arrastra el sol, o toca una hora del arco, para volver atrás en el día.',
  volver: 'Volver a ahora',
} as const;

/** «Este día no tiene noticias en Soacha.», o sin municipio si se ven todos. */
export function textoDiaSinNoticias(municipio: string | null): string {
  return municipio ? `Este día no tiene noticias en ${municipio}.` : 'Este día no tiene noticias.';
}
