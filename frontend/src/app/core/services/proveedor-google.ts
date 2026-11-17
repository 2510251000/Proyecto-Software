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

/**
 * Firebase Hosting publica la app en PROYECTO.web.app y en PROYECTO.firebaseapp.com. El inicio de
 * Google vive en el segundo (authDomain): si la app corre en el primero, los navegadores de
 * celular bloquean que ese otro dominio guarde datos y Firebase falla con «Unable to save initial
 * state». Por eso quien entra por web.app pasa al inicio de firebaseapp.com. Siempre a la raíz
 * fija, sin copiar nada de la URL: así la redirección no se puede usar para mandar a otro sitio.
 * Devuelve la dirección a la que hay que ir, o null si ya está en el dominio correcto.
 */
export function destinoEnDominioDeInicio(
  configuracion: ConfiguracionFirebase,
  ubicacion: Pick<Location, 'host'>,
): string | null {
  if (ubicacion.host !== `${configuracion.projectId}.web.app` || ubicacion.host === configuracion.authDomain) {
    return null;
  }
  return `https://${configuracion.authDomain}/`;
}

/**
 * Navegadores dentro de otras apps (WhatsApp, Instagram, Facebook, TikTok…): Google no deja iniciar
 * sesión en ellos, hay que abrir el enlace en Chrome o Safari.
 */
export function esNavegadorDeApp(agente = globalThis.navigator?.userAgent ?? ''): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|TikTok|musical_ly|Snapchat|Twitter|; wv\)/i.test(agente);
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
