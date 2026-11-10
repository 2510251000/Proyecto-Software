/** Fotos por noticia (el backend usa el mismo límite: IMAGENES_MAXIMO_POR_NOTICIA). */
export const MAXIMO_FOTOS = 4;

/** Antes de subir, cada foto se reduce a este lado mayor (px) y se guarda como JPEG con esta calidad. */
export const LADO_MAXIMO_PX = 1600;
export const CALIDAD_JPEG = 0.82;
export const TIPO_SALIDA = 'image/jpeg';
export const EXTENSION_SALIDA = '.jpg';

/** Lo que abre «Elegir fotos» (la galería en el celular, los archivos en el computador). */
export const TIPOS_ACEPTADOS = 'image/jpeg,image/png,image/webp,image/heic,image/heif';
/** «Tomar foto»: en el celular abre la cámara trasera. */
export const TIPOS_CAMARA = 'image/*';

/** Largo máximo de «Describe la foto» (igual que IMAGENES_LARGO_DESCRIPCION del backend). */
export const LARGO_MAXIMO_DESCRIPCION = 250;

/** Partes del formulario multipart de POST /api/noticias. */
export const PARTES_PUBLICAR = {
  datos: 'datos',
  imagenes: 'imagenes',
} as const;

export const TEXTOS_FOTOS = {
  titulo: 'Fotos (opcional)',
  ayuda: 'Hasta 4 fotos. La primera es la portada.',
  tomarFoto: 'Tomar foto',
  elegirFotos: 'Elegir fotos',
  soltarAqui: 'O arrastra las fotos aquí o pégalas con Ctrl+V',
  portada: 'Portada',
  quitar: 'Quitar',
  antes: 'Mover antes',
  despues: 'Mover después',
  describir: 'Describe la foto (opcional)',
  ayudaDescribir: 'Ayuda a quien usa lector de pantalla. Ejemplo: «Niños jugando en el parque».',
  procesando: 'Preparando las fotos…',
  subiendo: 'Subiendo',
  foto: 'Foto',
  flechaAntes: '←',
  flechaDespues: '→',
  de: 'de',
} as const;

export const MENSAJES_FOTOS = {
  demasiadas: `Puedes subir máximo ${MAXIMO_FOTOS} fotos por noticia.`,
  noEsImagen: (nombre: string) => `«${nombre}» no es una foto. Elige un archivo JPEG, PNG, WebP o HEIC.`,
  noSePudoLeer: (nombre: string) =>
    `No pudimos abrir «${nombre}». Si viene de un iPhone (formato HEIC), en Ajustes › Cámara › Formatos elige «Más compatible», o compártela como JPEG y vuelve a intentarlo.`,
} as const;
