import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriaMiniatura } from '../../core/models/categoria-miniatura.model';
import { Miniatura } from './miniatura';

const CATEGORIAS: CategoriaMiniatura[] = [
  'bici',
  'agua',
  'deporte',
  'parque',
  'comida',
  'mercado',
  'obra',
  'cultura',
];

describe('Miniatura', () => {
  let fixture: ComponentFixture<Miniatura>;
  const svg = () => (fixture.nativeElement as HTMLElement).querySelector('svg') as SVGSVGElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Miniatura] }).compileComponents();
    fixture = TestBed.createComponent(Miniatura);
  });

  it('es decorativa: los lectores de pantalla la ignoran', async () => {
    fixture.componentRef.setInput('categoria', 'agua');
    await fixture.whenStable();
    expect(svg().getAttribute('aria-hidden')).toBe('true');
  });

  it('dibuja algo distinto para cada categoría', async () => {
    const dibujos = new Set<string>();
    for (const categoria of CATEGORIAS) {
      fixture.componentRef.setInput('categoria', categoria);
      await fixture.whenStable();
      expect(svg().getAttribute('data-categoria')).toBe(categoria);
      // Además del fondo, cada categoría tiene su propio dibujo.
      expect(svg().children.length).toBeGreaterThan(1);
      dibujos.add(svg().innerHTML);
    }
    expect(dibujos.size).toBe(CATEGORIAS.length);
  });
});
