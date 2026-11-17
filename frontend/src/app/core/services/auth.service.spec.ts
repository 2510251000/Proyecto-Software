import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { crearAlmacenamientoFalso } from '../../../testing/almacenamiento-falso';
import { ahoraEnSegundos, crearToken } from '../../../testing/token-falso';
import { environment } from '../../../environments/environment';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { CODIGOS_HTTP } from '../constants/http.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ROLES } from '../constants/roles.constants';
import { ErrorApi } from '../models/error-api.model';
import { AuthService } from './auth.service';
import { ProveedorGoogle } from './proveedor-google';

describe('AuthService', () => {
  let servicio: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.stubGlobal('localStorage', crearAlmacenamientoFalso());
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

  describe('con Google', () => {
    const CONFIG = { apiKey: 'k', authDomain: 'a.firebaseapp.com', projectId: 'a', appId: '1:2:web:3' };
    let obtenerToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      obtenerToken = vi.fn(() => Promise.resolve('token-de-google'));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: ProveedorGoogle, useValue: { obtenerToken } },
        ],
      });
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      environment.firebase = null;
    });

    it('sin Firebase en el ambiente no está disponible y falla sin abrir nada', () => {
      const servicioSinGoogle = TestBed.inject(AuthService);
      let fallo = false;
      servicioSinGoogle.iniciarSesionConGoogle().subscribe({ error: () => (fallo = true) });
      expect(servicioSinGoogle.googleDisponible).toBe(false);
      expect(fallo).toBe(true);
      expect(obtenerToken).not.toHaveBeenCalled();
    });

    it('manda el token de Google al backend y guarda la sesión', async () => {
      environment.firebase = CONFIG;
      const conGoogle = TestBed.inject(AuthService);
      const respuesta = new Promise((listo) => conGoogle.iniciarSesionConGoogle().subscribe(listo));
      await Promise.resolve();
      await Promise.resolve();

      const peticion = http.expectOne(`${environment.apiUrl}${ENDPOINTS.loginGoogle}`);
      expect(obtenerToken).toHaveBeenCalledWith(CONFIG);
      expect(peticion.request.body).toEqual({ token: 'token-de-google' });
      peticion.flush({ token: 'jwt-de-aldia' });
      await respuesta;
      expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-de-aldia');
    });

    it('un error del backend llega como ErrorApi', async () => {
      environment.firebase = CONFIG;
      const conGoogle = TestBed.inject(AuthService);
      const error = new Promise<ErrorApi>((listo) => conGoogle.iniciarSesionConGoogle().subscribe({ error: listo }));
      await Promise.resolve();
      await Promise.resolve();
      http
        .expectOne(`${environment.apiUrl}${ENDPOINTS.loginGoogle}`)
        .flush({ mensaje: 'Tu cuenta está desactivada' }, { status: 403, statusText: 'Forbidden' });
      expect((await error).estado).toBe(403);
    });
  });

  it('inicia sesión y guarda el token', () => {
    servicio.iniciarSesion({ correo: 'a@b.co', contrasena: '12345678' }).subscribe();
    const peticion = http.expectOne(`${environment.apiUrl}${ENDPOINTS.login}`);
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ token: 'abc' });
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('abc');
  });

  it('registra un usuario con POST', () => {
    servicio.registrar({ correo: 'a@b.co', contrasena: '12345678', ciudadId: 1 }).subscribe();
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
    localStorage.setItem(CLAVE_TOKEN, crearToken(ahoraEnSegundos() + 3600));
    expect(servicio.haySesionVigente()).toBe(true);
    expect(servicio.obtenerContenidoToken()?.sub).toBe('a@b.co');
  });

  it('cierra la sesión si el token expiró', () => {
    localStorage.setItem(CLAVE_TOKEN, crearToken(ahoraEnSegundos() - 10));
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
