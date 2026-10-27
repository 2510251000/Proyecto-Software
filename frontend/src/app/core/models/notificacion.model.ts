export type TipoNotificacion = 'CERCANIA' | 'ASCENSO_NIVEL' | 'MODERACION' | 'COMENTARIO' | 'CALIFICACION';

/** Respuesta de GET /api/notificaciones. */
export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  /** La noticia de la que avisa, o null (por ejemplo, un ascenso de nivel). */
  noticiaId: number | null;
  leida: boolean;
  fecha: string;
}

/** Respuesta de GET /api/notificaciones/no-leidas. */
export interface ConteoNotificaciones {
  cantidad: number;
}
