import { ConfiguracionFirebase } from '../app/core/models/configuracion-firebase.model';

/**
 * PRODUCCIÓN en Firebase Hosting. La API va en el mismo dominio: Firebase Hosting reenvía
 * /api/** al backend en Cloud Run (ver firebase.json). Por eso apiUrl va vacío.
 */
export const environment = {
  production: true,
  apiUrl: '',
  /** Cada cuánto se pregunta al backend si hay notificaciones nuevas (milisegundos). */
  intervaloNotificacionesMs: 30000,
  /** Configuración web del proyecto de Firebase (no es secreta). Se llena al crear el proyecto. */
  firebase: null as ConfiguracionFirebase | null,
};
