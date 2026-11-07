import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { campanaFalsa } from '../../../../testing/menu-falso';
import { BarraInferior } from './barra-inferior';

describe('BarraInferior', () => {
  async function crear(noLeidas = 0): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [BarraInferior],
      providers: [provideRouter([]), campanaFalsa(noLeidas)],
    }).compileComponents();
    const fixture = TestBed.createComponent(BarraInferior);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('tiene portada, hoy, publicar en el centro, mapa y avisos', async () => {
    const barra = await crear();
    const enlaces = [...barra.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(enlaces).toEqual([
      `/${RUTAS.noticias}`,
      `/${RUTAS.hoy}`,
      `/${RUTAS.publicar}`,
      `/${RUTAS.mapa}`,
      `/${RUTAS.notificaciones}`,
    ]);
    expect(barra.querySelectorAll('a')[2].classList).toContain('publicar');
  });

  it('muestra los avisos sin leer y nada cuando no hay', async () => {
    expect((await crear(2)).querySelector('.contador')?.textContent).toContain('2');
    TestBed.resetTestingModule();
    expect((await crear(0)).querySelector('.contador')).toBeNull();
  });
});
