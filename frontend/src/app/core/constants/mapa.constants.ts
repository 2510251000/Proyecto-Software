/**
 * Mapas de OpenStreetMap (gratis y sin clave). Política de uso de sus servidores de teselas:
 * se muestra siempre la atribución, no se descargan teselas por adelantado ni para usar sin
 * conexión, y no se pasa del zoom máximo. https://operations.osmfoundation.org/policies/tiles/
 */
export const MAPA = {
  urlTeselas: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  zoomMaximo: 19,
  /** Zoom al centrar en el municipio del usuario. */
  zoomCiudad: 13,
  /** Zoom de la vista general cuando el usuario no tiene ciudad con coordenadas. */
  zoomGeneral: 8,
  /** Centro de la vista general: Cundinamarca, donde están los municipios del portal. */
  centroGeneral: { latitud: 4.6, longitud: -74.2 },
} as const;

export const TEXTOS_MAPA = {
  titulo: 'Mapa de noticias',
  bajada: 'Las noticias que tienen ubicación, sobre el mapa. Debajo, la misma lista en texto.',
  mapa: 'Mapa con las noticias',
  filtro: 'Tipo de noticia',
  leer: 'Leer la noticia',
  lista: 'Noticias del mapa',
  vacio: 'No hay noticias con ubicación para este filtro.',
  oficial: 'Oficial',
  comunidad: 'Comunidad',
  cargando: 'Cargando el mapa…',
} as const;
