import { TestBed } from '@angular/core/testing';
import { TEXTOS_NOTICIA } from '../../../core/constants/portada.constants';
import { noticiaFalsa } from '../../../../testing/noticia-falsa';
import { ContenidoNoticia } from './contenido-noticia';

describe('ContenidoNoticia', () => {
  async function crear(imagenes = 0, contenido?: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [ContenidoNoticia] }).compileComponents();
    const fixture = TestBed.createComponent(ContenidoNoticia);
    fixture.componentRef.setInput(
      'noticia',
      noticiaFalsa({
        ...(contenido ? { contenido } : {}),
        imagenes: Array.from({ length: imagenes }, (_, i) => ({
          url: `/api/noticias/1/imagenes/${i + 1}`,
          orden: i + 1,
          textoAlternativo: `Foto ${i + 1}`,
        })),
      }),
    );
    fixture.componentRef.setInput('idTitulo', 'titulo');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra la portada arriba y las demás fotos en una galería', async () => {
    const raiz = await crear(3);
    expect(raiz.querySelector('.imagen img')?.getAttribute('alt')).toBe('Foto 1');
    const galeria = raiz.querySelector('.galeria');
    expect(galeria?.getAttribute('aria-label')).toBe(TEXTOS_NOTICIA.galeria);
    expect([...(galeria?.querySelectorAll('img') ?? [])].map((i) => i.getAttribute('alt'))).toEqual(['Foto 2', 'Foto 3']);
  });

  it('sin fotos no hay galería', async () => {
    const raiz = await crear(0);
    expect(raiz.querySelector('.galeria')).toBeNull();
    expect(raiz.querySelector('.imagen img')).not.toBeNull();
  });

  it('la dirección de la fuente es un enlace que abre en otra pestaña; el resto sigue como texto', async () => {
    const raiz = await crear(0, 'Primer párrafo.\n\nFuente: Medio. Nota original: https://medio.co/nota.');
    const parrafos = raiz.querySelectorAll('.parrafo');
    expect(parrafos).toHaveLength(2);
    const enlace = parrafos[1].querySelector<HTMLAnchorElement>('a.enlace-fuente');
    expect(enlace?.getAttribute('href')).toBe('https://medio.co/nota');
    expect(enlace?.target).toBe('_blank');
    expect(enlace?.rel).toBe('noopener noreferrer');
    expect(parrafos[1].textContent?.replace(/\s+/g, ' ').trim()).toBe('Fuente: Medio. Nota original: https://medio.co/nota.');
    expect(parrafos[0].querySelector('a')).toBeNull();
  });
});
