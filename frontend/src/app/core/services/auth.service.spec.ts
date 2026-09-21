import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { CODIGOS_HTTP } from '../constants/http.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ROLES } from '../constants/roles.constants';
import { ErrorApi } from '../models/error-api.model';
import { AuthService } from './auth.service';

function crearToken(exp: number): string {
  const contenido = { sub: 'a@b.co', rol: ROLES.usuarioComun, id: 1, iat: 0, exp };
  const cuerpo = btoa(JSON.stringify(contenido))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `cabecera.${cuerpo}.firma`;
}

const AHORA_EN_SEGUNDOS = () => Math.floor(Date.now() / 1000);

describe('AuthService', () => {
  let servicio: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    // Node 26 define un localStorage global sin implementar que tapa el de jsdom.
    const datos = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (clave: string) => datos.get(clave) ?? null,
      setItem: (clave: string, valor: string) => datos.set(clave, valor),
      removeItem: (clave: string) => datos.delete(clave),
      clear: () => datos.clear(),
    });
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
  });

  it('inicia sesión y guarda el token', () => {
    servicio.iniciarSesion({ correo: 'a@b.co', contrasena: '12345678' }).subscribe();
    const peticion = http.expectOne(`${environment.apiUrl}${ENDPOINTS.login}`);
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ token: 'abc' });
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('abc');
  });

  it('registra un usuario con POST', () => {
    servicio.registrar({ correo: 'a@b.co', contrasena: '12345678' }).subscribe();
    const peticion = http.expectOne(`${environment.apiUrl}${ENDPOINTS.registro}`);
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ id: 3, correo: 'a@b.co', rol: ROLES.usuarioComun }, { status: 201, statusText: 'Created' });
  });

  it.each([
    [CODIGOS_HTTP.solicitudInvalida, MENSAJES_ERROR_HTTP.validacion],
    [CODIGOS_HTTP.noAutorizado, MENSAJES_ERROR_HTTP.credencialesInvalidas],
    [CODIGOS_HTTP.conflicto, MENSAJES_ERROR_HTTP.correoRepetido],
    [403, MENSAJES_ERROR_HTTP.generico],
    [500, MENSAJES_ERROR_HTTP.generico],
  ])('traduce el código %i al mensaje esperado', (estado, mensaje) => {
    let recibido: ErrorApi | undefined;
    servicio.iniciarSesion({ correo: 'a@b.co', contrasena: '12345678' }).subscribe({
      error: (error: ErrorApi) => (recibido = error),
    });
    http.expectOne(`${environment.apiUrl}${ENDPOINTS.login}`).flush(null, { status: estado, statusText: 'x' });
    expect(recibido).toEqual({ estado, mensaje });
  });

  it('la sesión es vigente con un token que no ha expirado', () => {
    localStorage.setItem(CLAVE_TOKEN, crearToken(AHORA_EN_SEGUNDOS() + 3600));
    expect(servicio.haySesionVigente()).toBe(true);
    expect(servicio.obtenerContenidoToken()?.sub).toBe('a@b.co');
  });

  it('cierra la sesión si el token expiró', () => {
    localStorage.setItem(CLAVE_TOKEN, crearToken(AHORA_EN_SEGUNDOS() - 10));
    expect(servicio.haySesionVigente()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('cierra la sesión si el token está dañado', () => {
    localStorage.setItem(CLAVE_TOKEN, 'no-es-un-jwt');
    expect(servicio.haySesionVigente()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('no hay sesión sin token', () => {
    expect(servicio.haySesionVigente()).toBe(false);
  });
});
