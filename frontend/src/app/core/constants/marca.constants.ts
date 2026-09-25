export const NOMBRE_PORTAL = 'Al Día';

/** Por debajo de este tamaño (en px) el logo usa la versión reducida: sol más grande y un solo filete. */
export const TAMANO_MINIMO_LOGO_COMPLETO = 24;

/** Textos del panel azul de login y registro. */
export const TEXTOS_PANEL_MARCA = {
  titularLogin: 'Lo que pasa en tu municipio, contado por tu gente',
  titularRegistro: 'Cuenta lo que pasa en tu barrio',
  bajada: 'Información oficial y reportes de la comunidad, en un solo lugar.',
} as const;

/** Datos del portal que se muestran abajo del panel azul. Son 6 las ciudades del catálogo. */
export const DATOS_PORTAL: readonly { valor: string; texto: string }[] = [
  { valor: '6', texto: 'municipios' },
  { valor: '24/7', texto: 'al día' },
  { valor: '100 %', texto: 'gratuito' },
];
