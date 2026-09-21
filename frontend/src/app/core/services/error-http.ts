import { HttpErrorResponse } from '@angular/common/http';
import { CODIGOS_HTTP } from '../constants/http.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ErrorApi } from '../models/error-api.model';

export function aErrorApi(error: HttpErrorResponse): ErrorApi {
  switch (error.status) {
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
