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

  it('tiene la forma del feed: dos publicaciones grandes y cuatro compactas', async () => {
    const raiz = await crear();
    expect(raiz.querySelectorAll('.grande')).toHaveLength(2);
    expect(raiz.querySelectorAll('.compacta')).toHaveLength(4);
  });

  it('solo anuncia «Cargando» a los lectores de pantalla; las formas grises se ocultan', async () => {
    const raiz = await crear();
    expect(raiz.querySelector('[role="status"]')?.textContent?.trim()).toBe(TEXTOS_COMUNES.cargando);
    const secciones = [...raiz.querySelectorAll('.seccion')];
    expect(secciones.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
