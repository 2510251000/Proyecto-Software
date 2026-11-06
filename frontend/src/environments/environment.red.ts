// RED LOCAL: para abrir la app desde el celular en la misma Wi-Fi (ver README).
// La IP del computador no se escribe aquí: la API se busca en el mismo equipo desde el que
// se abrió la página (http://192.168.x.y:4200 → http://192.168.x.y:8080).
const PUERTO_API = 8080;

export const environment = {
  production: false,
  apiUrl: `${globalThis.location.protocol}//${globalThis.location.hostname}:${PUERTO_API}`,
  /** Cada cuánto se pregunta al backend si hay notificaciones nuevas (milisegundos). */
  intervaloNotificacionesMs: 30000,
};
