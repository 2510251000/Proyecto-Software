import { RUTA_IMAGENES_NOTICIAS } from './categorias.constants';

/** Carpeta de las fotos de prensa del fondo del login (licencia CC0, ver CREDITOS.md ahí mismo). */
export const RUTA_IMAGENES_FONDO_LOGIN = '/imagenes/fondo-login';

/** Un recorte de periódico del fondo del login: foto, sección y titular. Solo decoración. */
export interface RecorteNoticia {
  readonly imagen: string;
  readonly seccion: string;
  readonly titular: string;
}

const fondo = (archivo: string) => `${RUTA_IMAGENES_FONDO_LOGIN}/${archivo}.webp`;
const noticia = (archivo: string) => `${RUTA_IMAGENES_NOTICIAS}/${archivo}.webp`;

/**
 * Recortes del mosaico de fondo del login, intercalando fotos de prensa y fotos de las
 * categorías del portal. Los titulares son de ejemplo: no son noticias reales.
 */
export const RECORTES_FONDO_LOGIN: readonly RecorteNoticia[] = [
  { imagen: fondo('periodicos-1'), seccion: 'Economía', titular: 'El comercio local cierra el mes con más ventas' },
  { imagen: noticia('obra'), seccion: 'Obras', titular: 'Arranca la pavimentación de la vía principal' },
  { imagen: fondo('camara-2'), seccion: 'En vivo', titular: 'Así avanza la sesión del concejo municipal' },
  { imagen: noticia('mercado'), seccion: 'Plaza de mercado', titular: 'Los precios de la semana, puesto por puesto' },
  { imagen: fondo('quiosco'), seccion: 'Comunidad', titular: 'Vuelven los quioscos a la plaza principal' },
  { imagen: noticia('deporte'), seccion: 'Deportes', titular: 'El equipo local clasifica a la gran final' },
  { imagen: fondo('microfono'), seccion: 'Cultura', titular: 'La emisora comunitaria estrena programa juvenil' },
  { imagen: noticia('agua'), seccion: 'Servicios', titular: 'Corte de agua programado en tres barrios' },
  { imagen: fondo('ciudad-1'), seccion: 'Movilidad', titular: 'Nuevo horario de pico y placa desde el lunes' },
  { imagen: noticia('cultura'), seccion: 'Agenda', titular: 'El festival de teatro abre su convocatoria' },
  { imagen: fondo('periodicos-2'), seccion: 'Negocios', titular: 'Emprendedores del barrio se unen en una feria' },
  { imagen: noticia('parque'), seccion: 'Ciudad', titular: 'Reabren el parque central tras su remodelación' },
  { imagen: fondo('ciudad-2'), seccion: 'Fin de año', titular: 'Las calles se iluminan para la temporada' },
  { imagen: noticia('bici'), seccion: 'Recreación', titular: 'La ciclovía dominical suma dos kilómetros' },
  { imagen: fondo('periodicos-3'), seccion: 'Opinión', titular: 'Cartas de los lectores: lo que falta en el barrio' },
  { imagen: noticia('comida'), seccion: 'Gastronomía', titular: 'Feria de cocina reúne a cuarenta cocineros' },
  { imagen: fondo('periodicos-4'), seccion: 'Tecnología', titular: 'Internet gratis llega a cinco parques más' },
  { imagen: fondo('ciudad-3'), seccion: 'Centro', titular: 'Los peatones estrenan andenes más anchos' },
  { imagen: fondo('periodicos-5'), seccion: 'Última hora', titular: 'Lo que debes saber antes de salir hoy' },
];
