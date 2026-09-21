// PENDIENTE de confirmar con David: GET /api/noticias aún no existe en el backend.
// Estos campos son provisionales y pueden cambiar (por ejemplo, ciudad podría
// llegar como objeto en lugar de texto).
export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  fechaPublicacion: string;
  ciudad: string;
}
