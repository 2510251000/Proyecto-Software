import { Noticia } from '../app/core/models/noticia.model';

/** Noticia de prueba con valores por defecto; se sobreescribe lo que haga falta. */
export function noticiaFalsa(cambios: Partial<Noticia> = {}): Noticia {
  return {
    id: 1,
    titulo: 'Feria campesina en la plaza',
    resumen: 'Productores de la región venden sus cosechas.',
    contenido: 'Contenido de la noticia.',
    fechaPublicacion: '2026-11-04T09:00:00',
    oficial: false,
    ciudad: 'Fusagasugá',
    ciudadId: 1,
    autor: 'Laura Méndez',
    autorNivel: 2,
    estado: 'PUBLICADA',
    ...cambios,
  };
}
