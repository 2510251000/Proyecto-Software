import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MENSAJES_UBICACION } from '../constants/ubicacion.constants';
import { ErrorApi } from '../models/error-api.model';
import { GeolocalizacionService } from './geolocalizacion.service';

type Exito = (posicion: GeolocationPosition) => void;
type Fallo = (error: GeolocationPositionError) => void;

/** Reemplaza navigator.geolocation por uno que responde como se le indique. */
function simularGps(responder: (exito: Exito, fallo: Fallo) => void): void {
  const geolocation: Pick<Geolocation, 'getCurrentPosition'> = {
    getCurrentPosition: (exito, fallo) => responder(exito, (error) => fallo?.(error)),
  };
  vi.stubGlobal('navigator', { geolocation });
}

function falloConCodigo(code: number): GeolocationPositionError {
  return { code, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
}

function mensajeDeError(servicio: GeolocalizacionService): Promise<string> {
  return new Promise((resolver) =>
    servicio.posicionActual().subscribe({ error: (error: ErrorApi) => resolver(error.mensaje) }),
  );
}

describe('GeolocalizacionService', () => {
  let servicio: GeolocalizacionService;

  beforeEach(() => {
    servicio = new GeolocalizacionService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('entrega las coordenadas que da el navegador', async () => {
    simularGps((exito) =>
      exito({ coords: { latitude: 4.33, longitude: -74.36 } } as GeolocationPosition),
    );
    const punto = await new Promise((resolver) => servicio.posicionActual().subscribe(resolver));
    expect(punto).toEqual({ latitud: 4.33, longitud: -74.36 });
  });

  it('explica cuando el permiso está bloqueado', async () => {
    simularGps((_exito, fallo) => fallo(falloConCodigo(1)));
    expect(await mensajeDeError(servicio)).toBe(MENSAJES_UBICACION.permisoDenegado);
  });

  it('explica cuando el navegador no puede calcular la posición', async () => {
    simularGps((_exito, fallo) => fallo(falloConCodigo(2)));
    expect(await mensajeDeError(servicio)).toBe(MENSAJES_UBICACION.posicionNoDisponible);
  });

  it('no se queda esperando si el navegador nunca responde (aviso de permiso cerrado)', async () => {
    vi.useFakeTimers();
    simularGps(() => undefined);
    const mensaje = mensajeDeError(servicio);
    vi.advanceTimersByTime(30_000);
    expect(await mensaje).toBe(MENSAJES_UBICACION.sinRespuesta);
  });
});
