import { inject, Injectable, InjectionToken } from '@angular/core';
import type { Auth, AuthProvider, UserCredential } from 'firebase/auth';
import { ConfiguracionFirebase } from '../models/configuracion-firebase.model';

/** Firebase ya descargado e iniciado, listo para abrir Google sin ninguna espera. */
export interface FirebaseListo {
  auth: Auth;
  proveedor: AuthProvider;
  conVentana: (auth: Auth, proveedor: AuthProvider) => Promise<UserCredential>;
  conRedireccion: (auth: Auth, proveedor: AuthProvider) => Promise<never>;
  resultadoRedireccion: (auth: Auth) => Promise<UserCredential | null>;
}

/** Marca, mientras se va a Google y se vuelve, que hay un inicio por redirección pendiente. */
export const CLAVE_REDIRECCION_GOOGLE = 'aldia-google-redireccion';

/** Descarga Firebase solo cuando se va a usar, así no pesa en la carga de la aplicación. */
export const CARGADOR_FIREBASE = new InjectionToken<(configuracion: ConfiguracionFirebase) => Promise<FirebaseListo>>(
  'CARGADOR_FIREBASE',
  { factory: () => cargarFirebase },
);

/**
 * Abre la ventana de Google (Firebase Authentication) y entrega el token de identidad que el
 * backend verifica.
 *
 * Safari (Mac, iPhone y iPad) solo deja abrir una ventana emergente en el mismo instante del toque:
 * si antes hay que descargar Firebase, la bloquea. Por eso el botón llama a preparar() apenas
 * aparece y obtenerToken() abre la ventana sin esperar nada. Si aun así el navegador la bloquea,
 * se entra por redirección: la página va a Google y vuelve (ver tokenDeRedireccion).
 */
@Injectable({ providedIn: 'root' })
export class ProveedorGoogle {
  private readonly cargar = inject(CARGADOR_FIREBASE);
  private listo: FirebaseListo | null = null;
  private preparando: Promise<FirebaseListo> | null = null;

  /** Descarga e inicia Firebase. Se puede llamar varias veces: lo hace una sola. */
  preparar(configuracion: ConfiguracionFirebase): Promise<FirebaseListo> {
    this.preparando ??= this.cargar(configuracion).then(
      (listo) => {
        this.listo = listo;
        return listo;
      },
      (error: unknown) => {
        this.preparando = null; // sin red, por ejemplo: el próximo toque lo vuelve a intentar
        throw error;
      },
    );
    return this.preparando;
  }

  obtenerToken(configuracion: ConfiguracionFirebase): Promise<string> {
    const credencial = this.listo
      ? this.abrir(this.listo) // sin esperas: la ventana se abre dentro del toque
      : this.preparar(configuracion).then((listo) => this.abrir(listo));
    return credencial.then((resultado) => resultado.user.getIdToken());
  }

  /** Al volver de Google por redirección: su token, o null si no había nada pendiente. */
  async tokenDeRedireccion(configuracion: ConfiguracionFirebase): Promise<string | null> {
    if (sessionStorage.getItem(CLAVE_REDIRECCION_GOOGLE) === null) {
      return null;
    }
    sessionStorage.removeItem(CLAVE_REDIRECCION_GOOGLE);
    const listo = await this.preparar(configuracion);
    const resultado = await listo.resultadoRedireccion(listo.auth);
    return resultado ? resultado.user.getIdToken() : null;
  }

  private abrir(listo: FirebaseListo): Promise<UserCredential> {
    return listo.conVentana(listo.auth, listo.proveedor).catch((error: unknown) => {
      if (codigoFirebase(error) !== 'auth/popup-blocked') {
        throw error;
      }
      sessionStorage.setItem(CLAVE_REDIRECCION_GOOGLE, '1');
      return listo.conRedireccion(listo.auth, listo.proveedor);
    });
  }
}

async function cargarFirebase(configuracion: ConfiguracionFirebase): Promise<FirebaseListo> {
  const { getApps, initializeApp } = await import('firebase/app');
  const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } =
    await import('firebase/auth');
  const app = getApps()[0] ?? initializeApp(configuracion);
  const auth = getAuth(app);
  // En Safari Firebase deja lista de antemano la conexión con Google; esto espera a que termine.
  await auth.authStateReady();
  const proveedor = new GoogleAuthProvider();
  // Siempre deja elegir la cuenta (en un computador compartido no entra con la última usada).
  proveedor.setCustomParameters({ prompt: 'select_account' });
  return {
    auth,
    proveedor,
    conVentana: signInWithPopup,
    conRedireccion: signInWithRedirect,
    resultadoRedireccion: getRedirectResult,
  };
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
