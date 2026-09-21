import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ErrorApi } from '../models/error-api.model';
import { Noticia } from '../models/noticia.model';
import { NoticiaService } from './noticia.service';

const URL_NOTICIAS = `${environment.apiUrl}${ENDPOINTS.noticias}`;

describe('NoticiaService', () => {
  let servicio: NoticiaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(NoticiaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las noticias con GET', () => {
    const noticias: Noticia[] = [
      {
        id: 1,
        titulo: 'Título',
        resumen: 'Resumen',
        contenido: 'Contenido',
        fechaPublicacion: '2026-09-21T10:00:00',
        ciudad: 'Fusagasugá',
      },
    ];
    let recibidas: Noticia[] = [];
    servicio.listar().subscribe((respuesta) => (recibidas = respuesta));

    const peticion = http.expectOne(URL_NOTICIAS);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(noticias);
    expect(recibidas).toEqual(noticias);
  });

  it('traduce un error del servidor al mensaje genérico', () => {
    let recibido: ErrorApi | undefined;
    servicio.listar().subscribe({ error: (error: ErrorApi) => (recibido = error) });
    http.expectOne(URL_NOTICIAS).flush(null, { status: 500, statusText: 'Error' });
    expect(recibido).toEqual({ estado: 500, mensaje: MENSAJES_ERROR_HTTP.generico });
  });
});
