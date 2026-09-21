import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { ContenidoToken } from '../models/contenido-token.model';
import { CredencialesLogin } from '../models/credenciales-login.model';
import { RespuestaAutenticacion } from '../models/respuesta-autenticacion.model';
import { RespuestaRegistro } from '../models/respuesta-registro.model';
import { SolicitudRegistro } from '../models/solicitud-registro.model';
import { aErrorApi } from './error-http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

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
