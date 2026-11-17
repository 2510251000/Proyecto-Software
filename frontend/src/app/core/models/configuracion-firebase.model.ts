/**
 * Configuración web del proyecto de Firebase (consola → Configuración del proyecto → Tus apps).
 * No es secreta: Firebase la pensó para ir en el navegador. La seguridad la dan los dominios
 * autorizados en Authentication y la verificación del token en el backend.
 */
export interface ConfiguracionFirebase {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}
