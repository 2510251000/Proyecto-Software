export const CODIGOS_HTTP = {
  solicitudInvalida: 400,
  noAutorizado: 401,
  conflicto: 409,
} as const;

export const ENCABEZADO_AUTORIZACION = 'Authorization';
export const PREFIJO_TOKEN = 'Bearer';
