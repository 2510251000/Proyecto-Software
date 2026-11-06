import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TEXTOS_REPORTES_ADMIN } from '../../../core/constants/interaccion.constants';
import { EstadoReporte, Reporte } from '../../../core/models/interaccion.model';
import { AdminService } from '../../../core/services/admin.service';
import { ReportesAdmin } from './reportes-admin';

function reporte(id: number, estado: EstadoReporte = 'PENDIENTE'): Reporte {
  return {
    id,
    noticiaId: 10 + id,
    noticiaTitulo: `Noticia ${id}`,
    noticiaEstado: 'PUBLICADA',
    usuarioId: 2,
    usuario: 'Lector',
    motivo: 'NOTICIA_FALSA',
    descripcion: 'No es cierto',
    estado,
    fecha: '2026-11-04T09:00:00',
  };
}

describe('ReportesAdmin', () => {
  let reportes: ReturnType<typeof vi.fn>;
  let cambiarEstadoReporte: ReturnType<typeof vi.fn>;
  let cambiarEstado: ReturnType<typeof vi.fn>;

  async function crear(lista: Reporte[]) {
    reportes = vi.fn(() => of(lista));
    cambiarEstadoReporte = vi.fn((id: number, estado: EstadoReporte) => of({ ...reporte(id), estado }));
    cambiarEstado = vi.fn(() => of({}));
    await TestBed.configureTestingModule({
      imports: [ReportesAdmin],
      providers: [provideRouter([]), { provide: AdminService, useValue: { reportes, cambiarEstadoReporte, cambiarEstado } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReportesAdmin);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  it('arranca mostrando los pendientes, con motivo, descripción y quién reportó', async () => {
    const { raiz } = await crear([reporte(1)]);
    expect(reportes).toHaveBeenCalledWith('PENDIENTE');
    expect(raiz.querySelector('.fila')?.textContent).toContain('No es cierto');
    expect(raiz.querySelector('.fila')?.textContent).toContain(`${TEXTOS_REPORTES_ADMIN.por} Lector`);
  });

  it('marcar como revisado lo saca de los pendientes', async () => {
    const { fixture, raiz } = await crear([reporte(1)]);
    const botones = [...raiz.querySelectorAll<HTMLButtonElement>('.accion')];
    botones.find((b) => b.textContent?.includes(TEXTOS_REPORTES_ADMIN.revisado))?.click();
    await fixture.whenStable();
    expect(cambiarEstadoReporte).toHaveBeenCalledWith(1, 'REVISADO');
    expect(raiz.textContent).toContain(TEXTOS_REPORTES_ADMIN.vacio);
  });

  it('ocultar la noticia usa la moderación y marca el reporte como revisado', async () => {
    const { fixture } = await crear([reporte(1)]);
    fixture.componentInstance.ocultarNoticia(reporte(1));
    expect(cambiarEstado).toHaveBeenCalledWith(11, 'OCULTA');
    expect(cambiarEstadoReporte).toHaveBeenCalledWith(1, 'REVISADO');
  });

  it('con el filtro «Todos» pide todos y deja ver los ya revisados', async () => {
    const { fixture, raiz } = await crear([reporte(1, 'REVISADO')]);
    const selector = raiz.querySelector('select') as HTMLSelectElement;
    selector.value = '';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(reportes).toHaveBeenLastCalledWith(undefined);
    expect(raiz.querySelectorAll('.fila')).toHaveLength(1);
  });

  it('muestra los errores', async () => {
    const { fixture, raiz } = await crear([reporte(1)]);
    cambiarEstadoReporte.mockReturnValue(throwError(() => ({ estado: 403, mensaje: 'Sin permiso' })));
    fixture.componentInstance.marcar(reporte(1), 'DESCARTADO');
    await fixture.whenStable();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Sin permiso');
  });
});

describe('AdminService reportes', () => {
  it('lista con filtro y cambia el estado', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(AdminService);
    const http = TestBed.inject(HttpTestingController);
    servicio.reportes('PENDIENTE').subscribe();
    expect(http.expectOne(`${environment.apiUrl}/api/admin/reportes?estado=PENDIENTE`).request.method).toBe('GET');
    servicio.reportes().subscribe();
    http.expectOne(`${environment.apiUrl}/api/admin/reportes`);
    servicio.cambiarEstadoReporte(4, 'DESCARTADO').subscribe();
    expect(http.expectOne(`${environment.apiUrl}/api/admin/reportes/4`).request.body).toEqual({ estado: 'DESCARTADO' });
    http.verify();
  });
});
