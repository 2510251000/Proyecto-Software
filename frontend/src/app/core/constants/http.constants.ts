export const CODIGOS_HTTP = {
  solicitudInvalida: 400,
  noAutorizado: 401,
  prohibido: 403,
  noEncontrado: 404,
  conflicto: 409,
  demasiadasPeticiones: 429,
  noDisponible: 503,
} as const;

export const ENCABEZADO_AUTORIZACION = 'Authorization';
export const PREFIJO_TOKEN = 'Bearer';
