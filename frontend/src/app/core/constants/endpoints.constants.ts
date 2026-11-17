export const ENDPOINTS = {
  registro: '/api/auth/registro',
  login: '/api/auth/login',
  usuarioActual: '/api/usuarios/me',
  noticias: '/api/noticias',
  notificaciones: '/api/notificaciones',
  notificacionesNoLeidas: '/api/notificaciones/no-leidas',
  notificacionesLeidas: '/api/notificaciones/leidas',
  ciudades: '/api/ubicacion/ciudades',
  buscarUbicacion: '/api/ubicacion/buscar',
  resolverUbicacion: '/api/ubicacion/resolver',
  adminNoticias: '/api/admin/noticias',
  adminUsuarios: '/api/admin/usuarios',
  adminReportes: '/api/admin/reportes',
  alertas: '/api/alertas',
  alertasPendientes: '/api/alertas/pendientes',
} as const;

/** Parámetros de búsqueda que entiende GET /api/noticias. */
export const PARAMETROS_NOTICIAS = {
  tipo: 'tipo',
  ciudad: 'ciudadId',
  texto: 'q',
  orden: 'orden',
  estado: 'estado',
} as const;

/** Sufijos de ruta que se agregan a un recurso: /api/notificaciones/5/leida. */
export const SUFIJOS = {
  leida: 'leida',
  estado: 'estado',
  comentarios: 'comentarios',
  calificacion: 'calificacion',
  reportes: 'reportes',
  resuelta: 'resuelta',
} as const;
