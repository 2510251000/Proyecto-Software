import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUTA_IMAGENES_NOTICIAS } from '../../core/constants/categorias.constants';
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
  const raiz = () => fixture.nativeElement as HTMLElement;
  const foto = () => raiz().querySelector('img');
  const svg = () => raiz().querySelector('svg') as SVGSVGElement;

  async function mostrar(categoria: CategoriaMiniatura): Promise<void> {
    fixture.componentRef.setInput('categoria', categoria);
    await fixture.whenStable();
  }

  /** Simula que la foto no se pudo cargar. */
  async function fallarFoto(): Promise<void> {
    foto()?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Miniatura] }).compileComponents();
    fixture = TestBed.createComponent(Miniatura);
  });

  it('muestra la foto de la categoría, con texto alternativo y carga diferida', async () => {
    await mostrar('agua');
    expect(foto()?.getAttribute('src')).toBe(`${RUTA_IMAGENES_NOTICIAS}/agua.webp`);
    expect(foto()?.getAttribute('alt')).toBeTruthy();
    expect(foto()?.getAttribute('loading')).toBe('lazy');
    expect(svg()).toBeNull();
  });

  it('cada categoría tiene su propio texto alternativo', async () => {
    const textos = new Set<string | null>();
    for (const categoria of CATEGORIAS) {
      await mostrar(categoria);
      textos.add(foto()?.getAttribute('alt') ?? null);
    }
    expect(textos.size).toBe(CATEGORIAS.length);
  });

  it('si la foto no carga, muestra el dibujo, que es decorativo', async () => {
    await mostrar('agua');
    await fallarFoto();
    expect(foto()).toBeNull();
    expect(svg().getAttribute('aria-hidden')).toBe('true');
  });

  it('el dibujo de respaldo es distinto para cada categoría', async () => {
    await mostrar('bici');
    await fallarFoto();
    const dibujos = new Set<string>();
    for (const categoria of CATEGORIAS) {
      await mostrar(categoria);
      expect(svg().getAttribute('data-categoria')).toBe(categoria);
      // Además del fondo, cada categoría tiene su propio dibujo.
      expect(svg().children.length).toBeGreaterThan(1);
      dibujos.add(svg().innerHTML);
    }
    expect(dibujos.size).toBe(CATEGORIAS.length);
  });
});
