import { ConfiguracionFirebase } from '../app/core/models/configuracion-firebase.model';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  /** Cada cuánto se pregunta al backend si hay notificaciones nuevas (milisegundos). */
  intervaloNotificacionesMs: 30000,
  /** Inicio de sesión con Google (Firebase). null: el botón «Continuar con Google» no aparece. */
  firebase: null as ConfiguracionFirebase | null,
};
