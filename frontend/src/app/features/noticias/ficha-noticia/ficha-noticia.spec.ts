import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { FichaNoticia, VarianteFicha } from './ficha-noticia';

const DIA = '2026-11-09';

const NOTICIA: Noticia = {
  id: 5,
  titulo: 'El mercado campesino vuelve a la plaza los domingos',
  resumen: 'Resumen',
  contenido: 'Contenido de la noticia',
  fechaPublicacion: `${DIA}T10:30:00-05:00`,
  oficial: false,
  ciudad: 'Fusagasugá',
  autor: 'Carlos Activo',
  autorNivel: 2,
};

describe('FichaNoticia', () => {
  let fixture: ComponentFixture<FichaNoticia>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const enlace = () => raiz().querySelector<HTMLAnchorElement>('a.ficha') as HTMLAnchorElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  async function mostrar(variante: VarianteFicha, cambios: Partial<Noticia> = {}, dia = DIA): Promise<void> {
    fixture.componentRef.setInput('variante', variante);
    fixture.componentRef.setInput('noticia', { ...NOTICIA, ...cambios });
    fixture.componentRef.setInput('dia', dia);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FichaNoticia], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(FichaNoticia);
  });

  it.each<VarianteFicha>(['foto-grande', 'color', 'con-foto', 'horizontal'])(
    'la ficha «%s» es un enlace a la noticia, con el titular en un h3, y avisa para abrir la vista rápida',
    async (variante) => {
      await mostrar(variante);
      const abiertas: Noticia[] = [];
      fixture.componentInstance.abrir.subscribe((noticia) => abiertas.push(noticia));

      expect(enlace().classList).toContain(variante);
      expect(enlace().getAttribute('href')).toBe(`/${RUTAS.noticias}/5`);
      expect(texto('h3')).toBe(NOTICIA.titulo);
      expect(raiz().querySelectorAll('a')).toHaveLength(1);

      enlace().click();
      expect(abiertas.map((n) => n.id)).toEqual([5]);
    },
  );

  it('una noticia del día mostrado lleva su hora; una de otro día, hace cuánto fue', async () => {
    await mostrar('con-foto');
    expect(texto('time')).toBe('10:30 a. m.');
    expect(raiz().querySelector('time')?.getAttribute('datetime')).toBe(NOTICIA.fechaPublicacion);

    await mostrar('con-foto', { fechaPublicacion: new Date(Date.now() - 2 * 86_400_000).toISOString() });
    expect(texto('time')).toBe('anteayer');
  });

  it('con una fecha rota no muestra la hora', async () => {
    await mostrar('con-foto', { fechaPublicacion: 'rota' });
    expect(raiz().querySelector('time')).toBeNull();
    expect(texto('.datos')).toBe('Fusagasugá');
  });

  describe('foto grande', () => {
    it('lleva la foto con su texto alternativo, la etiqueta, la hora y la línea de autor', async () => {
      await mostrar('foto-grande');
      expect(raiz().querySelector('img')?.getAttribute('alt')).toBeTruthy();
      expect(raiz().querySelector('img')?.getAttribute('loading')).toBe('lazy');
      expect(texto('.etiqueta')).toBe(`${ETIQUETAS_NOTICIA.comunidad} · ${ETIQUETAS_NOTICIA.etiquetaNivel} 2`);
      expect(texto('time')).toBe('10:30 a. m.');
      expect(texto('.datos')).toBe(
        `Carlos Activo · Fusagasugá · 1 ${ETIQUETAS_NOTICIA.minutos} ${ETIQUETAS_NOTICIA.deLectura}`,
      );
      expect(raiz().querySelector('.degradado')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('de color', () => {
    it('no lleva foto: etiqueta, flecha decorativa, titular y autor con municipio y hora', async () => {
      await mostrar('color');
      expect(raiz().querySelector('app-miniatura')).toBeNull();
      expect(raiz().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(texto('.etiqueta')).toBe(`${ETIQUETAS_NOTICIA.comunidad} · ${ETIQUETAS_NOTICIA.etiquetaNivel} 2`);
      expect(texto('.texto .datos')).toBe('Carlos Activo · Fusagasugá · 10:30 a. m.');
    });
  });

  describe('con foto', () => {
    it('lleva la foto arriba y, debajo, la etiqueta con el municipio y la hora', async () => {
      await mostrar('con-foto', { oficial: true });
      expect(raiz().querySelector('img')).not.toBeNull();
      expect(texto('.etiqueta')).toBe(ETIQUETAS_NOTICIA.oficial);
      expect(raiz().querySelector('.etiqueta')?.classList).toContain('oficial');
      expect(texto('.fila .datos')).toBe('Fusagasugá · 10:30 a. m.');
      // El autor solo sale en la ficha horizontal.
      expect(raiz().querySelectorAll('.datos')).toHaveLength(1);
    });

    it('una de la comunidad no lleva el color de «Oficial»', async () => {
      await mostrar('con-foto');
      expect(raiz().querySelector('.etiqueta')?.classList).not.toContain('oficial');
    });
  });

  describe('horizontal', () => {
    it('agrega el autor debajo del titular', async () => {
      await mostrar('horizontal', {}, '2026-11-10');
      expect(texto('.texto > .datos')).toBe('Carlos Activo');
      expect(raiz().querySelector('img')).not.toBeNull();
    });

    it('si la API no trae el autor, usa el nombre genérico', async () => {
      await mostrar('horizontal', { autor: undefined, oficial: true });
      expect(texto('.texto > .datos')).toBe(ETIQUETAS_NOTICIA.autorOficial);
    });
  });
});
