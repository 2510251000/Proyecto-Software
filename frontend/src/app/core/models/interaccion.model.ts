/** Un comentario de GET /api/noticias/{id}/comentarios. */
export interface Comentario {
  id: number;
  contenido: string;
  fecha: string;
  autorId: number;
  autor: string;
  autorNivel: number;
}

/** Respuesta de PUT /api/noticias/{id}/calificacion. */
export interface ResultadoCalificacion {
  promedio: number;
  cantidadCalificaciones: number;
  miCalificacion: number;
}

export type MotivoReporte = 'NOTICIA_FALSA' | 'CONTENIDO_OFENSIVO' | 'SPAM' | 'OTRO';
export type EstadoReporte = 'PENDIENTE' | 'REVISADO' | 'DESCARTADO';

/** Cuerpo de POST /api/noticias/{id}/reportes. */
export interface NuevoReporte {
  motivo: MotivoReporte;
  descripcion?: string;
}

/** Un reporte del panel del administrador (GET /api/admin/reportes). */
export interface Reporte {
  id: number;
  noticiaId: number;
  noticiaTitulo: string;
  noticiaEstado: 'PUBLICADA' | 'OCULTA' | 'ELIMINADA';
  usuarioId: number;
  usuario: string;
  motivo: MotivoReporte;
  descripcion: string | null;
  estado: EstadoReporte;
  fecha: string;
}
