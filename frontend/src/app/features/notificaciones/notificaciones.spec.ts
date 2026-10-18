import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TEXTOS_NOTIFICACIONES } from '../../core/constants/pantallas.constants';
import { Notificacion } from '../../core/models/notificacion.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { Notificaciones } from './notificaciones';

const AVISOS: Notificacion[] = [
  {
    id: 1,
    tipo: 'CERCANIA',
    mensaje: 'Nueva noticia en Fusagasugá: Se cayó un árbol',
    noticiaId: 40,
    leida: false,
    fecha: '2026-10-18T09:00:00',
  },
  {
    id: 2,
    tipo: 'ASCENSO_NIVEL',
    mensaje: '¡Subiste al nivel 2 (Activo)!',
    noticiaId: null,
    leida: true,
    fecha: '2026-10-17T09:00:00',
  },
];

describe('Notificaciones', () => {
  let fixture: ComponentFixture<Notificaciones>;
  const marcarLeida = vi.fn(() => of(undefined));
  const marcarTodasLeidas = vi.fn(() => of(undefined));

  const raiz = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [
        provideRouter([]),
        { provide: NotificacionService, useValue: { listar: () => of(AVISOS), marcarLeida, marcarTodasLeidas } },
        { provide: AuthService, useValue: { obtenerContenidoToken: () => null, cerrarSesion: () => undefined } },
        campanaFalsa(1),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Notificaciones);
    await fixture.whenStable();
  });

  it('lista las notificaciones y resalta las no leídas', () => {
    const filas = raiz().querySelectorAll('li.aviso');
    expect(filas.length).toBe(2);
    expect(filas[0].classList).toContain('no-leida');
    expect(filas[0].textContent).toContain('Se cayó un árbol');
    expect(filas[1].classList).not.toContain('no-leida');
  });

  it('al abrir la noticia del aviso lo marca como leído', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    raiz().querySelector<HTMLButtonElement>('li.aviso .accion')?.click();
    await fixture.whenStable();
    expect(marcarLeida).toHaveBeenCalledWith(1);
    expect(navegar).toHaveBeenCalledWith(['/', 'noticias', 40]);
    expect(raiz().querySelector('li.aviso')?.classList).not.toContain('no-leida');
  });

  it('marca todas como leídas', async () => {
    const boton = [...raiz().querySelectorAll('button')].find((b) =>
      b.textContent?.includes(TEXTOS_NOTIFICACIONES.marcarTodas),
    );
    boton?.click();
    await fixture.whenStable();
    expect(marcarTodasLeidas).toHaveBeenCalled();
    expect(raiz().querySelectorAll('li.no-leida').length).toBe(0);
  });
});
