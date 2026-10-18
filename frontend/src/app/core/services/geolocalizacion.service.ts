import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MENSAJES_UBICACION } from '../constants/ubicacion.constants';
import { ErrorApi } from '../models/error-api.model';
import { Coordenadas } from '../models/ubicacion.model';

/** Sin un código HTTP real: los errores del GPS se reportan con estado 0. */
const ESTADO_SIN_HTTP = 0;
const ERROR_PERMISO_DENEGADO = 1;
const TIEMPO_MAXIMO_MS = 15_000;

/**
 * Pide al navegador la posición del usuario (con su permiso). Solo las coordenadas;
 * el municipio lo averigua el backend con la API de mapas.
 */
@Injectable({ providedIn: 'root' })
export class GeolocalizacionService {
  disponible(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  posicionActual(): Observable<Coordenadas> {
    return new Observable<Coordenadas>((suscriptor) => {
      if (!this.disponible()) {
        suscriptor.error(this.error(MENSAJES_UBICACION.gpsNoDisponible));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          suscriptor.next({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
          suscriptor.complete();
        },
        (fallo) =>
          suscriptor.error(
            this.error(
              fallo.code === ERROR_PERMISO_DENEGADO
                ? MENSAJES_UBICACION.permisoDenegado
                : MENSAJES_UBICACION.gpsFallo,
            ),
          ),
        { enableHighAccuracy: false, timeout: TIEMPO_MAXIMO_MS },
      );
    });
  }

  private error(mensaje: string): ErrorApi {
    return { estado: ESTADO_SIN_HTTP, mensaje };
  }
}
