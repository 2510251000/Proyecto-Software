import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, from, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { ContenidoToken } from '../models/contenido-token.model';
import { CredencialesLogin } from '../models/credenciales-login.model';
import { RespuestaAutenticacion } from '../models/respuesta-autenticacion.model';
import { RespuestaRegistro } from '../models/respuesta-registro.model';
import { SolicitudRegistro } from '../models/solicitud-registro.model';
import { aErrorApi } from './error-http';
import { ProveedorGoogle } from './proveedor-google';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly google = inject(ProveedorGoogle);

  /** true si este ambiente tiene configurado el inicio con Google. */
  readonly googleDisponible = environment.firebase !== null;

  registrar(datos: SolicitudRegistro): Observable<RespuestaRegistro> {
    return this.http
      .post<RespuestaRegistro>(`${environment.apiUrl}${ENDPOINTS.registro}`, datos)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => aErrorApi(error))));
  }

  iniciarSesion(datos: CredencialesLogin): Observable<RespuestaAutenticacion> {
    return this.http
      .post<RespuestaAutenticacion>(`${environment.apiUrl}${ENDPOINTS.login}`, datos)
      .pipe(
        tap((respuesta) => localStorage.setItem(CLAVE_TOKEN, respuesta.token)),
        catchError((error: HttpErrorResponse) => throwError(() => aErrorApi(error))),
      );
  }

  /**
   * Abre la ventana de Google y, con el token que entrega Firebase, inicia sesión en el backend
   * (que crea la cuenta si no existe). Los errores de la API llegan como ErrorApi; los de la
   * ventana de Google, tal cual (ver codigoFirebase).
   */
  iniciarSesionConGoogle(): Observable<RespuestaAutenticacion> {
    const configuracion = environment.firebase;
    if (configuracion === null) {
      return throwError(() => new Error('Firebase no está configurado en este ambiente'));
    }
    // obtenerToken se llama aquí mismo (no al suscribirse): así la ventana se abre dentro del toque.
    return from(this.google.obtenerToken(configuracion)).pipe(switchMap((token) => this.entrarConGoogle(token)));
  }

  /** Descarga Firebase antes de que la persona toque el botón (Safari lo necesita, ver ProveedorGoogle). */
  prepararGoogle(): void {
    const configuracion = environment.firebase;
    if (configuracion !== null) {
      this.google.preparar(configuracion).catch(() => undefined); // si falla, se reintenta al tocar
    }
  }

  /** Si la página vuelve de Google por redirección, termina de iniciar sesión; si no, entrega null. */
  retomarGoogle(): Observable<RespuestaAutenticacion | null> {
    const configuracion = environment.firebase;
    if (configuracion === null) {
      return of(null);
    }
    return from(this.google.tokenDeRedireccion(configuracion)).pipe(
      switchMap((token) => (token === null ? of(null) : this.entrarConGoogle(token))),
    );
  }

  private entrarConGoogle(token: string): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${environment.apiUrl}${ENDPOINTS.loginGoogle}`, { token }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => aErrorApi(error))),
      tap((respuesta) => localStorage.setItem(CLAVE_TOKEN, respuesta.token)),
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  /** Devuelve el contenido del token, o null si no hay sesión o el token ya expiró. */
  obtenerContenidoToken(): ContenidoToken | null {
    return this.haySesionVigente() ? this.decodificar(this.obtenerToken()) : null;
  }

  /** Si el token falta, está dañado o expiró, cierra la sesión y devuelve false. */
  haySesionVigente(): boolean {
    const contenido = this.decodificar(this.obtenerToken());
    const vigente = contenido !== null && contenido.exp * 1000 > Date.now();
    if (!vigente) {
      this.cerrarSesion();
    }
    return vigente;
  }

  private decodificar(token: string | null): ContenidoToken | null {
    const partes = token?.split('.');
    if (partes?.length !== 3) {
      return null;
    }
    try {
      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
      const contenido = JSON.parse(new TextDecoder().decode(bytes)) as ContenidoToken;
      return typeof contenido.exp === 'number' ? contenido : null;
    } catch {
      return null;
    }
  }
}
