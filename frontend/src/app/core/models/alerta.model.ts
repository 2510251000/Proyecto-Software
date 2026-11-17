/** Qué está pasando en una alerta de emergencia. */
export type TipoAlerta = 'DESAPARICION' | 'ROBO' | 'EMERGENCIA';

/** Respuesta de GET /api/alertas y GET /api/alertas/{noticiaId}. Los detalles están en la noticia. */
export interface Alerta {
  noticiaId: number;
  tipo: TipoAlerta;
  titulo: string;
  resumen: string | null;
  ciudad: string;
  ciudadId: number;
  autorId: number;
  fecha: string;
  /** false cuando el autor o un administrador la dio por resuelta. */
  activa: boolean;
  fechaResuelta: string | null;
}

/** Respuesta de GET /api/alertas/pendientes: una alerta que el usuario todavía no ha visto. */
export interface AlertaPendiente {
  /** La notificación que se marca como leída al cerrar el aviso. */
  notificacionId: number;
  alerta: Alerta;
}
