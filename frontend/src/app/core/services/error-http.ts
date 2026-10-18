import { HttpErrorResponse } from '@angular/common/http';
import { catchError, OperatorFunction, throwError } from 'rxjs';
import { CODIGOS_HTTP } from '../constants/http.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ErrorApi } from '../models/error-api.model';

/** Sin respuesta del servidor (apagado, sin red o bloqueado por CORS). */
const SIN_CONEXION = 0;

/** Códigos en los que el backend explica el problema en su campo "mensaje". */
const CODIGOS_CON_MENSAJE_DEL_SERVIDOR: readonly number[] = [
  CODIGOS_HTTP.solicitudInvalida,
  CODIGOS_HTTP.prohibido,
  CODIGOS_HTTP.noEncontrado,
  CODIGOS_HTTP.demasiadasPeticiones,
  CODIGOS_HTTP.noDisponible,
];

function mensajeDelServidor(cuerpo: unknown): string | null {
  if (typeof cuerpo === 'object' && cuerpo !== null && 'mensaje' in cuerpo) {
    const mensaje = cuerpo.mensaje;
    return typeof mensaje === 'string' && mensaje.trim() !== '' ? mensaje : null;
  }
  return null;
}

/** Operador para los servicios: convierte cualquier error HTTP en un ErrorApi con mensaje para el usuario. */
export function conErrorApi<T>(): OperatorFunction<T, T> {
  return catchError((error: HttpErrorResponse) => throwError(() => aErrorApi(error)));
}

export function aErrorApi(error: HttpErrorResponse): ErrorApi {
  const delServidor = mensajeDelServidor(error.error);
  if (delServidor !== null && CODIGOS_CON_MENSAJE_DEL_SERVIDOR.includes(error.status)) {
    return { estado: error.status, mensaje: delServidor };
  }
  switch (error.status) {
    case SIN_CONEXION:
      return { estado: error.status, mensaje: MENSAJES_ERROR_HTTP.sinConexion };
    case CODIGOS_HTTP.solicitudInvalida:
      return { estado: error.status, mensaje: MENSAJES_ERROR_HTTP.validacion };
    case CODIGOS_HTTP.noAutorizado:
      return { estado: error.status, mensaje: MENSAJES_ERROR_HTTP.credencialesInvalidas };
    case CODIGOS_HTTP.conflicto:
      return { estado: error.status, mensaje: MENSAJES_ERROR_HTTP.correoRepetido };
    default:
      return { estado: error.status, mensaje: MENSAJES_ERROR_HTTP.generico };
  }
}
