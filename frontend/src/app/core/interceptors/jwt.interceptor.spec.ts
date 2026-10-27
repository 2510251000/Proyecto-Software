import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { crearAlmacenamientoFalso } from '../../../testing/almacenamiento-falso';
import { environment } from '../../../environments/environment';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../constants/navegacion.constants';
import { RUTAS } from '../constants/rutas.constants';
import { jwtInterceptor } from './jwt.interceptor';

const TOKEN = 'token-de-prueba';
const URL_NOTICIAS = `${environment.apiUrl}${ENDPOINTS.noticias}`;

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let controlador: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal('localStorage', crearAlmacenamientoFalso());
    localStorage.setItem(CLAVE_TOKEN, TOKEN);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    controlador.verify();
    vi.unstubAllGlobals();
  });

  it('adjunta el token a las peticiones hacia la API', () => {
    http.get(URL_NOTICIAS).subscribe();
    const peticion = controlador.expectOne(URL_NOTICIAS);
    expect(peticion.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    peticion.flush([]);
  });

  it.each([ENDPOINTS.login, ENDPOINTS.registro])('no adjunta el token a %s', (ruta) => {
    http.post(`${environment.apiUrl}${ruta}`, {}).subscribe();
    const peticion = controlador.expectOne(`${environment.apiUrl}${ruta}`);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it.each(['https://maps.googleapis.com/maps/api', `${environment.apiUrl}.dominio-malo.net/api`])(
    'no envía el token a otros dominios (%s)',
    (url) => {
      http.get(url).subscribe();
      const peticion = controlador.expectOne(url);
      expect(peticion.request.headers.has('Authorization')).toBe(false);
      peticion.flush({});
    },
  );

  it('no adjunta nada si no hay token', () => {
    localStorage.removeItem(CLAVE_TOKEN);
    http.get(URL_NOTICIAS).subscribe();
    const peticion = controlador.expectOne(URL_NOTICIAS);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush([]);
  });

  it('ante un 401 con token cierra la sesión y redirige al login', () => {
    http.get(URL_NOTICIAS).subscribe({ error: () => undefined });
    controlador.expectOne(URL_NOTICIAS).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login], {
      queryParams: { [PARAMETROS_URL.motivo]: MOTIVOS_LOGIN.sesionExpirada },
    });
  });

  it('ante un 403 no cierra la sesión', () => {
    http.get(URL_NOTICIAS).subscribe({ error: () => undefined });
    controlador.expectOne(URL_NOTICIAS).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe(TOKEN);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('un 401 sin token no redirige', () => {
    localStorage.removeItem(CLAVE_TOKEN);
    http.get(URL_NOTICIAS).subscribe({ error: () => undefined });
    controlador.expectOne(URL_NOTICIAS).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(navegar).not.toHaveBeenCalled();
  });
});
