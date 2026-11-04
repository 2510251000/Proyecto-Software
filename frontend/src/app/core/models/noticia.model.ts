/** Estados de una noticia en el backend. Solo las PUBLICADA se ven en la portada. */
export type EstadoNoticia = 'PUBLICADA' | 'OCULTA' | 'ELIMINADA';

/** Una foto de la noticia. La url es relativa a la API (environment.apiUrl). El orden 1 es la portada. */
export interface ImagenNoticia {
  url: string;
  orden: number;
  textoAlternativo: string | null;
}

/** Respuesta de GET /api/noticias y GET /api/noticias/{id}. */
export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  fechaPublicacion: string;
  /** true si la publicó un administrador (noticia oficial); false si viene de la comunidad. */
  oficial: boolean;
  ciudad: string;
  ciudadId?: number;
  /** Nombre visible del autor (nunca su correo). */
  autor?: string;
  /** Nivel del autor, de 1 a 3. */
  autorNivel?: number;
  estado?: EstadoNoticia;
  /** Fotos en orden; vacía o ausente si la noticia no tiene. */
  imagenes?: ImagenNoticia[];
}

/** Cuerpo de POST /api/noticias. */
export interface NuevaNoticia {
  titulo: string;
  resumen: string;
  contenido: string;
  ciudadId: number;
  latitud?: number;
  longitud?: number;
  /** Descripción de cada foto, en el mismo orden (solo al publicar con fotos). */
  descripcionesImagenes?: string[];
}

export type TipoNoticias = 'TODAS' | 'OFICIALES' | 'COMUNITARIAS';
export type OrdenNoticias = 'RECIENTES' | 'RECOMENDADAS';

/** Filtros opcionales del listado. */
export interface CriteriosNoticias {
  tipo?: TipoNoticias;
  ciudadId?: number;
  texto?: string;
  orden?: OrdenNoticias;
}
