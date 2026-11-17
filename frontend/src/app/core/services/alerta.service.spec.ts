import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { INTERVALO_ALERTAS_MS } from '../constants/alertas.constants';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { Alerta, AlertaPendiente } from '../models/alerta.model';
import { AlertaService } from './alerta.service';
import { CampanaNotificaciones } from './campana-notificaciones';
import { NotificacionService } from './notificacion.service';
import { VigiaAlertas } from './vigia-alertas';

const API = environment.apiUrl;

const ALERTA: Alerta = {
  noticiaId: 50,
  tipo: 'DESAPARICION',
  titulo: 'Se busca a Ana, 8 años',
  resumen: 'Vista por última vez en el parque',
  ciudad: 'Fusagasugá',
  ciudadId: 7,
  autorId: 1,
  fecha: '2026-11-17T09:00:00',
  activa: true,
  fechaResuelta: null,
};

describe('AlertaService', () => {
  let http: HttpTestingController;
  let servicio: AlertaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(AlertaService);
  });

  afterEach(() => http.verify());

  it('pide las vigentes de la ciudad del usuario o de la ciudad indicada', () => {
    servicio.vigentes().subscribe();
    const propia = http.expectOne(`${API}${ENDPOINTS.alertas}`);
    expect(propia.request.params.keys()).toEqual([]);
    propia.flush([]);

    servicio.vigentes(4).subscribe();
    const otra = http.expectOne((p) => p.url === `${API}${ENDPOINTS.alertas}`);
    expect(otra.request.params.get('ciudadId')).toBe('4');
    otra.flush([]);
  });

  it('pide las pendientes, la alerta de una noticia y la resuelve', () => {
    servicio.pendientes().subscribe();
    http.expectOne(`${API}${ENDPOINTS.alertasPendientes}`).flush([]);

    servicio.deNoticia(50).subscribe();
    http.expectOne(`${API}${ENDPOINTS.alertas}/50`).flush(ALERTA);

    servicio.resolver(50).subscribe();
    const resolver = http.expectOne(`${API}${ENDPOINTS.alertas}/50/resuelta`);
    expect(resolver.request.method).toBe('PUT');
    resolver.flush({ ...ALERTA, activa: false });
  });
});

describe('VigiaAlertas', () => {
  const pendiente: AlertaPendiente = { notificacionId: 900, alerta: ALERTA };
  let pendientes: ReturnType<typeof vi.fn>;
  let marcarLeida: ReturnType<typeof vi.fn>;
  let actualizar: ReturnType<typeof vi.fn>;
  let alDestruir: (() => void)[];
  const destruccion = {
    onDestroy: (fn: () => void) => alDestruir.push(fn),
  } as unknown as DestroyRef;

  beforeEach(() => {
    vi.useFakeTimers();
    alDestruir = [];
    pendientes = vi.fn(() => of([pendiente]));
    marcarLeida = vi.fn(() => of(undefined));
    actualizar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: AlertaService, useValue: { pendientes } },
        { provide: NotificacionService, useValue: { marcarLeida } },
        { provide: CampanaNotificaciones, useValue: { actualizar } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('pregunta enseguida y luego cada cierto tiempo, y para cuando nadie lo necesita', () => {
    const vigia = TestBed.inject(VigiaAlertas);
    vigia.vigilar(destruccion);
    vigia.vigilar(destruccion);
    vi.advanceTimersByTime(0);
    expect(vigia.actual()).toEqual(pendiente);
    vi.advanceTimersByTime(INTERVALO_ALERTAS_MS);
    expect(pendientes).toHaveBeenCalledTimes(2);

    alDestruir.forEach((fn) => fn());
    vi.advanceTimersByTime(INTERVALO_ALERTAS_MS * 3);
    expect(pendientes).toHaveBeenCalledTimes(2);
  });

  it('al cerrar la saca de la fila, la marca leída y no vuelve a saltar', () => {
    const vigia = TestBed.inject(VigiaAlertas);
    vigia.vigilar(destruccion);
    vi.advanceTimersByTime(0);

    vigia.cerrar(pendiente);

    expect(vigia.actual()).toBeNull();
    expect(marcarLeida).toHaveBeenCalledWith(900);
    expect(actualizar).toHaveBeenCalled();
    vi.advanceTimersByTime(INTERVALO_ALERTAS_MS);
    expect(vigia.pendientes()).toEqual([]);
  });
});
