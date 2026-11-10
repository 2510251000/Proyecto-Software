import { TestBed } from '@angular/core/testing';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { EsqueletoPortada } from './esqueleto-portada';

describe('EsqueletoPortada', () => {
  async function crear(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [EsqueletoPortada] }).compileComponents();
    const fixture = TestBed.createComponent(EsqueletoPortada);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('tiene la forma de la portada: el bloque oscuro y el mosaico con 3 y 4 fichas', async () => {
    const raiz = await crear();
    expect(raiz.querySelector('.portada')).not.toBeNull();
    const filas = [...raiz.querySelectorAll('.fila')];
    expect(filas.map((f) => f.querySelectorAll('.ficha').length)).toEqual([3, 4]);
    expect(filas[0].querySelector('.grande')).not.toBeNull();
    expect(filas[0].querySelector('.mapa')).not.toBeNull();
    expect(filas[0].querySelector('.nivel')).not.toBeNull();
  });

  it('solo anuncia «Cargando» a los lectores de pantalla; las formas grises se ocultan', async () => {
    const raiz = await crear();
    expect(raiz.querySelector('[role="status"]')?.textContent?.trim()).toBe(TEXTOS_COMUNES.cargando);
    const formas = [...raiz.querySelectorAll('.portada, .fila')];
    expect(formas).toHaveLength(3);
    expect(formas.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
