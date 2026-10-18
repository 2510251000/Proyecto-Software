export interface SolicitudRegistro {
  correo: string;
  contrasena: string;
  nombre?: string;
  /** Ciudad obtenida con la API de ubicación. */
  ciudadId: number;
}
