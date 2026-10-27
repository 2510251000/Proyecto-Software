import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { MENSAJES_ERROR_HTTP } from '../constants/mensajes.constants';
import { ErrorApi } from '../models/error-api.model';
import { AdminService } from './admin.service';
import { NoticiaService } from './noticia.service';
import { NotificacionService } from './notificacion.service';
import { UbicacionService } from './ubicacion.service';

const API = environment.apiUrl;

describe('servicios de la API', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('NoticiaService', () => {
    it('envía solo los filtros que se usan', () => {
      TestBed.inject(NoticiaService)
        .listar({ tipo: 'OFICIALES', ciudadId: 4, texto: '  agua  ', orden: 'RECOMENDADAS' })
        .subscribe();
      const peticion = http.expectOne((p) => p.url === `${API}${ENDPOINTS.noticias}`);
      expect(peticion.request.params.get('tipo')).toBe('OFICIALES');
      expect(peticion.request.params.get('ciudadId')).toBe('4');
      expect(peticion.request.params.get('q')).toBe('agua');
      expect(peticion.request.params.get('orden')).toBe('RECOMENDADAS');
      peticion.flush([]);
    });

    it('no manda una búsqueda vacía', () => {
      TestBed.inject(NoticiaService).listar({ texto: '   ' }).subscribe();
      const peticion = http.expectOne(`${API}${ENDPOINTS.noticias}`);
      expect(peticion.request.params.keys()).toEqual([]);
      peticion.flush([]);
    });

    it('publica con POST y muestra el mensaje del backend cuando se alcanza el límite', () => {
      let recibido: ErrorApi | undefined;
      TestBed.inject(NoticiaService)
        .publicar({ titulo: 't', resumen: '', contenido: 'c', ciudadId: 1 })
        .subscribe({ error: (error: ErrorApi) => (recibido = error) });
      const peticion = http.expectOne(`${API}${ENDPOINTS.noticias}`);
      expect(peticion.request.method).toBe('POST');
      const mensaje = 'Alcanzaste el límite de 3 noticias por día de tu nivel Básico';
      peticion.flush({ estado: 429, mensaje }, { status: 429, statusText: 'Too Many Requests' });
      expect(recibido).toEqual({ estado: 429, mensaje });
    });

    it('sin conexión con el backend lo dice claramente', () => {
      let recibido: ErrorApi | undefined;
      TestBed.inject(NoticiaService)
        .obtener(5)
        .subscribe({ error: (error: ErrorApi) => (recibido = error) });
      http.expectOne(`${API}${ENDPOINTS.noticias}/5`).error(new ProgressEvent('error'), { status: 0 });
      expect(recibido?.mensaje).toBe(MENSAJES_ERROR_HTTP.sinConexion);
    });
  });

  describe('NotificacionService', () => {
    it('cuenta las no leídas y marca una como leída', () => {
      const servicio = TestBed.inject(NotificacionService);
      let cantidad = -1;
      servicio.contarNoLeidas().subscribe((valor) => (cantidad = valor));
      http.expectOne(`${API}${ENDPOINTS.notificacionesNoLeidas}`).flush({ cantidad: 2 });
      expect(cantidad).toBe(2);

      servicio.marcarLeida(9).subscribe();
      const marcar = http.expectOne(`${API}${ENDPOINTS.notificaciones}/9/leida`);
      expect(marcar.request.method).toBe('PUT');
      marcar.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('UbicacionService', () => {
    it('busca por nombre y resuelve un lugar o unas coordenadas en el backend', () => {
      const servicio = TestBed.inject(UbicacionService);
      servicio.buscar(' Fusa ').subscribe();
      const busqueda = http.expectOne((p) => p.url === `${API}${ENDPOINTS.buscarUbicacion}`);
      expect(busqueda.request.params.get('q')).toBe('Fusa');
      busqueda.flush([]);

      servicio.resolverLugar('osm:R1').subscribe();
      expect(http.expectOne(`${API}${ENDPOINTS.resolverUbicacion}`).request.body).toEqual({ idLugar: 'osm:R1' });

      servicio.resolverCoordenadas({ latitud: 4.3, longitud: -74.3 }).subscribe();
      expect(http.expectOne(`${API}${ENDPOINTS.resolverUbicacion}`).request.body).toEqual({
        latitud: 4.3,
        longitud: -74.3,
      });
    });
  });

  describe('AdminService', () => {
    it('oculta una noticia, la borra y cambia el nivel de un usuario', () => {
      const servicio = TestBed.inject(AdminService);
      servicio.cambiarEstado(3, 'OCULTA').subscribe();
      const ocultar = http.expectOne(`${API}${ENDPOINTS.adminNoticias}/3/estado`);
      expect(ocultar.request.method).toBe('PUT');
      expect(ocultar.request.body).toEqual({ estado: 'OCULTA' });

      servicio.borrar(3).subscribe();
      expect(http.expectOne(`${API}${ENDPOINTS.adminNoticias}/3`).request.method).toBe('DELETE');

      servicio.actualizarUsuario(8, { nivel: 2 }).subscribe();
      expect(http.expectOne(`${API}${ENDPOINTS.adminUsuarios}/8`).request.body).toEqual({ nivel: 2 });
    });
  });
});
