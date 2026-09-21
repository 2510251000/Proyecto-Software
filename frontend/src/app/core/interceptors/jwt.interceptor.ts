import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../constants/endpoints.constants';
import {
  CODIGOS_HTTP,
  ENCABEZADO_AUTORIZACION,
  PREFIJO_TOKEN,
} from '../constants/http.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../constants/navegacion.constants';
import { RUTAS } from '../constants/rutas.constants';
import { AuthService } from '../services/auth.service';

const URLS_SIN_TOKEN: readonly string[] = [
  `${environment.apiUrl}${ENDPOINTS.login}`,
  `${environment.apiUrl}${ENDPOINTS.registro}`,
];

// Se compara con la barra final para que "http://api.com.malo.net" no pase por "http://api.com".
function debeAdjuntarToken(url: string): boolean {
  return url.startsWith(`${environment.apiUrl}/`) && !URLS_SIN_TOKEN.includes(url);
}

export const jwtInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = debeAdjuntarToken(peticion.url) ? auth.obtenerToken() : null;

  if (token === null) {
    return siguiente(peticion);
  }

  const conToken = peticion.clone({
    setHeaders: { [ENCABEZADO_AUTORIZACION]: `${PREFIJO_TOKEN} ${token}` },
  });

  return siguiente(conToken).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === CODIGOS_HTTP.noAutorizado) {
        auth.cerrarSesion();
        void router.navigate([RUTAS.login], {
          queryParams: { [PARAMETROS_URL.motivo]: MOTIVOS_LOGIN.sesionExpirada },
        });
      }
      return throwError(() => error);
    }),
  );
};
