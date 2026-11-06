import { Noticia } from './noticia.model';

/** Una foto elegida en el selector, ya reducida en el navegador y lista para subir. */
export interface FotoSeleccionada {
  id: number;
  /** JPEG reducido (máximo LADO_MAXIMO_PX de lado y sin EXIF). */
  archivo: Blob;
  nombre: string;
  /** URL temporal (blob:) para la vista previa. */
  vistaPrevia: string;
  /** Texto alternativo que escribe la persona («Describe la foto»). */
  descripcion: string;
}

/** Lo que va pasando mientras se publica con fotos. */
export type ProgresoPublicacion =
  | { tipo: 'progreso'; porcentaje: number }
  | { tipo: 'listo'; noticia: Noticia };
