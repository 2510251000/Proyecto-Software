/** Velocidad de lectura promedio para calcular los minutos de lectura. */
export const PALABRAS_POR_MINUTO = 200;

/** Una noticia oficial es «Última hora» durante estas horas después de publicada. */
export const HORAS_ULTIMA_HORA = 3;

/** Noticias que se muestran al abrir la portada y que agrega cada clic en «Ver más». */
export const NOTICIAS_POR_TANDA = 12;

/** Notas pequeñas que acompañan a la nota principal de la apertura. */
export const CANTIDAD_SECUNDARIAS = 3;

/** Puestos de la lista «Lo más reciente de tu ciudad». */
export const CANTIDAD_RECIENTES_LATERAL = 5;

export const ETIQUETAS_NOTICIA = {
  ultimaHora: 'Última hora',
  oficial: 'Oficial',
  comunidad: 'Comunidad',
  minutos: 'min',
  deLectura: 'de lectura',
} as const;
