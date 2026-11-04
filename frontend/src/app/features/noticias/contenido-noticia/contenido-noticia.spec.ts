import { TestBed } from '@angular/core/testing';
import { TEXTOS_NOTICIA } from '../../../core/constants/portada.constants';
import { noticiaFalsa } from '../../../../testing/noticia-falsa';
import { ContenidoNoticia } from './contenido-noticia';

describe('ContenidoNoticia', () => {
  async function crear(imagenes = 0): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [ContenidoNoticia] }).compileComponents();
    const fixture = TestBed.createComponent(ContenidoNoticia);
    fixture.componentRef.setInput(
      'noticia',
      noticiaFalsa({
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
});
