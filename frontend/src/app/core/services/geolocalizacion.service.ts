import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MENSAJES_UBICACION } from '../constants/ubicacion.constants';
import { ErrorApi } from '../models/error-api.model';
import { Coordenadas } from '../models/ubicacion.model';

/** Sin un código HTTP real: los errores del GPS se reportan con estado 0. */
const ESTADO_SIN_HTTP = 0;
/** Códigos de GeolocationPositionError. */
const ERROR_PERMISO_DENEGADO = 1;
const ERROR_POSICION_NO_DISPONIBLE = 2;
/** Tiempo que el navegador tiene para leer la posición una vez dado el permiso. */
const TIEMPO_LECTURA_MS = 15_000;
/**
 * Tiempo máximo total, contando el aviso de permiso. Firefox (y Zen) nunca responden si el
 * usuario cierra el aviso sin elegir, así que sin este límite el botón quedaría cargando.
 */
const TIEMPO_MAXIMO_TOTAL_MS = 30_000;

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
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        suscriptor.error(this.error(MENSAJES_UBICACION.sitioNoSeguro));
        return;
      }
      const limite = setTimeout(
        () => suscriptor.error(this.error(MENSAJES_UBICACION.sinRespuesta)),
        TIEMPO_MAXIMO_TOTAL_MS,
      );
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          suscriptor.next({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
          suscriptor.complete();
        },
        (fallo) => suscriptor.error(this.error(this.mensajeDe(fallo.code))),
        { enableHighAccuracy: false, timeout: TIEMPO_LECTURA_MS, maximumAge: 0 },
      );
      return () => clearTimeout(limite);
    });
  }

  private mensajeDe(codigo: number): string {
    switch (codigo) {
      case ERROR_PERMISO_DENEGADO:
        return MENSAJES_UBICACION.permisoDenegado;
      case ERROR_POSICION_NO_DISPONIBLE:
        return MENSAJES_UBICACION.posicionNoDisponible;
      default:
        return MENSAJES_UBICACION.sinRespuesta;
    }
  }

  private error(mensaje: string): ErrorApi {
    return { estado: ESTADO_SIN_HTTP, mensaje };
  }
}
