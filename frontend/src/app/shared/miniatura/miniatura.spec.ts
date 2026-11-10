import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUTA_IMAGENES_NOTICIAS } from '../../core/constants/categorias.constants';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaMiniatura } from '../../core/models/categoria-miniatura.model';
import { ImagenNoticia } from '../../core/models/noticia.model';
import { ImagenService } from '../../core/services/imagen.service';
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

  it('como foto de fondo va sin texto alternativo', async () => {
    fixture.componentRef.setInput('decorativa', true);
    await mostrar('agua');
    expect(foto()?.getAttribute('alt')).toBe('');
  });

  it('como foto principal se pide de primera, sin carga diferida', async () => {
    await mostrar('agua');
    expect(foto()?.hasAttribute('fetchpriority')).toBe(false);

    fixture.componentRef.setInput('prioridad', true);
    await fixture.whenStable();
    expect(foto()?.getAttribute('loading')).toBe('eager');
    expect(foto()?.getAttribute('fetchpriority')).toBe('high');
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

  describe('con la foto real de la noticia', () => {
    const FOTO: ImagenNoticia = { url: '/api/noticias/3/imagenes/1', orden: 1, textoAlternativo: 'Árbol caído en la vía' };

    async function conFoto(foto: ImagenNoticia, protegida = false): Promise<void> {
      fixture.componentRef.setInput('categoria', 'parque');
      fixture.componentRef.setInput('foto', foto);
      fixture.componentRef.setInput('protegida', protegida);
      await fixture.whenStable();
    }

    it('la muestra con su descripción', async () => {
      await conFoto(FOTO);
      expect(foto()?.getAttribute('src')).toBe(`${environment.apiUrl}${FOTO.url}`);
      expect(foto()?.getAttribute('alt')).toBe(FOTO.textoAlternativo);
    });

    it('sin descripción, la foto es decorativa (el titular ya la explica)', async () => {
      await conFoto({ ...FOTO, textoAlternativo: null });
      expect(foto()?.getAttribute('alt')).toBe('');
    });

    it('si no carga, usa la foto de la categoría y luego el dibujo', async () => {
      await conFoto(FOTO);
      await fallarFoto();
      expect(foto()?.getAttribute('src')).toBe(`${RUTA_IMAGENES_NOTICIAS}/parque.webp`);
      await fallarFoto();
      expect(foto()).toBeNull();
      expect(svg()).not.toBeNull();
    });
  });
});

describe('Miniatura protegida', () => {
  const FOTO: ImagenNoticia = { url: '/api/noticias/8/imagenes/1', orden: 1, textoAlternativo: null };

  async function crear(respuesta: ReturnType<ImagenService['obtenerProtegida']>) {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:protegida'), revokeObjectURL: vi.fn() }));
    const obtenerProtegida = vi.fn(() => respuesta);
    await TestBed.configureTestingModule({
      imports: [Miniatura],
      providers: [{ provide: ImagenService, useValue: { obtenerProtegida } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Miniatura);
    fixture.componentRef.setInput('categoria', 'obra');
    fixture.componentRef.setInput('foto', FOTO);
    fixture.componentRef.setInput('protegida', true);
    await fixture.whenStable();
    return { fixture, obtenerProtegida };
  }

  afterEach(() => vi.unstubAllGlobals());

  it('la pide con sesión y la muestra desde la memoria del navegador', async () => {
    const { fixture, obtenerProtegida } = await crear(of(new Blob(['x'])));
    const raiz = fixture.nativeElement as HTMLElement;
    expect(obtenerProtegida).toHaveBeenCalledWith(`${environment.apiUrl}${FOTO.url}`);
    expect(raiz.querySelector('img')?.getAttribute('src')).toBe('blob:protegida');
    fixture.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:protegida');
  });

  it('si no la puede traer, usa la foto de la categoría', async () => {
    const { fixture } = await crear(throwError(() => ({ estado: 404, mensaje: '' })));
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('img')?.getAttribute('src')).toBe(`${RUTA_IMAGENES_NOTICIAS}/obra.webp`);
  });
});
