import { Injectable } from '@angular/core';
import { ConfiguracionFirebase } from '../models/configuracion-firebase.model';

/**
 * Abre la ventana de Google (Firebase Authentication) y entrega el token de identidad que el
 * backend verifica. Firebase se descarga solo cuando alguien toca «Continuar con Google»,
 * así no pesa en la carga de la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class ProveedorGoogle {
  async obtenerToken(configuracion: ConfiguracionFirebase): Promise<string> {
    const { getApps, initializeApp } = await import('firebase/app');
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const app = getApps()[0] ?? initializeApp(configuracion);
    const proveedor = new GoogleAuthProvider();
    // Siempre deja elegir la cuenta (en un computador compartido no entra con la última usada).
    proveedor.setCustomParameters({ prompt: 'select_account' });
    const resultado = await signInWithPopup(getAuth(app), proveedor);
    return resultado.user.getIdToken();
  }
}

/** Códigos de Firebase cuando la persona cierra o cancela la ventana: no es un error que mostrar. */
export const CANCELACIONES_GOOGLE: readonly string[] = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
];

/** El código de un error de Firebase, o null si no lo es. */
export function codigoFirebase(error: unknown): string | null {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null;
}
