import { environment } from '../../../environments/environment';
import { ImagenNoticia, Noticia } from '../models/noticia.model';

/** URL completa de una foto: la API la devuelve relativa a su propia dirección. */
export function urlImagen(imagen: ImagenNoticia): string {
  return `${environment.apiUrl}${imagen.url}`;
}

/** La foto de portada (orden 1) o null si la noticia no tiene fotos. */
export function portadaDe(noticia: Noticia): ImagenNoticia | null {
  return noticia.imagenes?.[0] ?? null;
}
