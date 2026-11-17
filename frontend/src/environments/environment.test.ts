import { ConfiguracionFirebase } from '../app/core/models/configuracion-firebase.model';

// PENDIENTE: reemplazar por la URL real del backend de TEST cuando David la tenga.
export const environment = {
  production: false,
  apiUrl: 'https://api-test.aldia.example',
  /** Cada cuánto se pregunta al backend si hay notificaciones nuevas (milisegundos). */
  intervaloNotificacionesMs: 30000,
  /** Inicio de sesión con Google (Firebase). null: el botón «Continuar con Google» no aparece. */
  firebase: null as ConfiguracionFirebase | null,
};
