import { ConfiguracionFirebase } from '../app/core/models/configuracion-firebase.model';

/**
 * PRODUCCIÓN: el frontend en Firebase Hosting (https://aldia-portal-noticias.web.app) y la API
 * en Render. Ver despliegue/LEEME.md.
 */
export const environment = {
  production: true,
  apiUrl: 'https://aldia-backend-epzs.onrender.com',
  /** Cada cuánto se pregunta al backend si hay notificaciones nuevas (milisegundos). */
  intervaloNotificacionesMs: 30000,
  /**
   * Configuración web del proyecto de Firebase (inicio de sesión con Google). No es secreta:
   * Firebase la pensó para ir en el navegador; la protegen los dominios autorizados.
   */
  firebase: {
    apiKey: 'AIzaSyBIT1JhmFHt40HHhTTG492h4OeW-lqdpYg',
    authDomain: 'aldia-portal-noticias.firebaseapp.com',
    projectId: 'aldia-portal-noticias',
    appId: '1:471199995877:web:e8e29d5a309730f1e6010c',
  } as ConfiguracionFirebase | null,
};
