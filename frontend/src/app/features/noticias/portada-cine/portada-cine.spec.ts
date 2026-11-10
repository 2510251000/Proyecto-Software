import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TEXTOS_CINE } from '../../../core/constants/dia-en-vivo.constants';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { PortadaCine } from './portada-cine';

const NOTICIA: Noticia = {
  id: 7,
  titulo: 'Fusagasugá inaugura la nueva ciclorruta del centro',
  resumen: 'La obra conecta el parque principal con la terminal.',
  contenido: 'Contenido de la noticia',
  fechaPublicacion: '2026-11-09T16:20:00-05:00',
  oficial: true,
  ciudad: 'Fusagasugá',
  autor: 'Administración municipal',
};

describe('PortadaCine', () => {
  let fixture: ComponentFixture<PortadaCine>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  async function mostrar(cambios: Partial<Noticia> = {}): Promise<void> {
    fixture.componentRef.setInput('noticia', { ...NOTICIA, ...cambios });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PortadaCine], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(PortadaCine);
  });

  it('el titular es el h1 de la pantalla y va con el resumen', async () => {
    await mostrar();
    expect(raiz().querySelectorAll('h1')).toHaveLength(1);
    expect(texto('h1')).toBe(NOTICIA.titulo);
    expect(texto('.resumen')).toBe(NOTICIA.resumen);
  });

  it('sin resumen no deja el párrafo vacío', async () => {
    await mostrar({ resumen: '' });
    expect(raiz().querySelector('.resumen')).toBeNull();
  });

  it('una noticia oficial lleva «Oficial», el municipio y la hora de publicación', async () => {
    await mostrar();
    expect(texto('.etiqueta.oficial')).toBe(ETIQUETAS_NOTICIA.oficial);
    expect(texto('.municipio')).toBe('Fusagasugá');
    expect(texto('time')).toBe('4:20 p. m.');
    expect(raiz().querySelector('time')?.getAttribute('datetime')).toBe(NOTICIA.fechaPublicacion);
  });

  it('una de la comunidad lleva «Comunidad · Nivel N»', async () => {
    await mostrar({ oficial: false, autorNivel: 2 });
    expect(texto('.etiqueta')).toBe(`${ETIQUETAS_NOTICIA.comunidad} · ${ETIQUETAS_NOTICIA.etiquetaNivel} 2`);
    expect(raiz().querySelector('.etiqueta.oficial')).toBeNull();
  });

  it('si la API no trae el nivel, dice solo «Comunidad»', async () => {
    await mostrar({ oficial: false });
    expect(texto('.etiqueta')).toBe(ETIQUETAS_NOTICIA.comunidad);
  });

  it('«Última hora» sale solo en una oficial de hace menos de tres horas', async () => {
    await mostrar();
    expect(raiz().querySelector('.urgente')).toBeNull();

    await mostrar({ fechaPublicacion: new Date(Date.now() - 30 * 60_000).toISOString() });
    expect(texto('.urgente')).toBe(ETIQUETAS_NOTICIA.ultimaHora);
  });

  it('con una fecha rota no muestra la hora', async () => {
    await mostrar({ fechaPublicacion: 'rota' });
    expect(raiz().querySelector('time')).toBeNull();
  });

  it('muestra las iniciales y el nombre del autor, y los minutos de lectura', async () => {
    await mostrar({ autor: 'Carlos Activo', oficial: false });
    expect(texto('.iniciales')).toBe('CA');
    expect(raiz().querySelector('.iniciales')?.getAttribute('aria-hidden')).toBe('true');
    expect(texto('.autor-nombre')).toBe('Carlos Activo');
    expect(texto('.lectura')).toBe(`1 ${ETIQUETAS_NOTICIA.minutos} ${ETIQUETAS_NOTICIA.deLectura}`);
  });

  it('«Leer la noticia» es un enlace a su página y avisa para abrir la vista rápida', async () => {
    await mostrar();
    const abiertas: Noticia[] = [];
    fixture.componentInstance.abrir.subscribe((noticia) => abiertas.push(noticia));
    const leer = raiz().querySelector<HTMLAnchorElement>('a.leer');
    expect(leer?.textContent).toContain(TEXTOS_CINE.leer);
    expect(leer?.getAttribute('href')).toBe(`/${RUTAS.noticias}/7`);

    leer?.click();
    expect(abiertas.map((n) => n.id)).toEqual([7]);
  });

  it('«Ver en el mapa» sale solo si la noticia tiene coordenadas', async () => {
    await mostrar();
    expect(raiz().querySelector('a.mapa')).toBeNull();

    await mostrar({ latitud: 4.34, longitud: -74.36 });
    const mapa = raiz().querySelector('a.mapa');
    expect(mapa?.textContent).toContain(TEXTOS_CINE.verEnMapa);
    expect(mapa?.getAttribute('href')).toBe(`/${RUTAS.mapa}`);
  });

  it('la foto es de fondo: sin texto alternativo, oculta a los lectores y con prioridad', async () => {
    await mostrar();
    const foto = raiz().querySelector('.capas img');
    expect(raiz().querySelector('.capas')?.getAttribute('aria-hidden')).toBe('true');
    expect(foto?.getAttribute('alt')).toBe('');
    expect(foto?.getAttribute('loading')).toBe('eager');
    expect(foto?.getAttribute('fetchpriority')).toBe('high');
  });

  it('al cambiar de noticia la foto nueva se funde sobre la anterior', async () => {
    await mostrar();
    expect(raiz().querySelectorAll('.capas app-miniatura')).toHaveLength(1);

    await mostrar({ id: 8, titulo: 'Abren las inscripciones para las escuelas deportivas' });
    const fotos = [...raiz().querySelectorAll('.capas app-miniatura img')];
    expect(fotos.map((f) => f.getAttribute('src'))).toEqual([
      expect.stringContaining('bici'),
      expect.stringContaining('deporte'),
    ]);

    // Un tercer cambio deja solo las dos últimas.
    await mostrar({ id: 9, titulo: 'Cortes de agua programados' });
    expect(raiz().querySelectorAll('.capas app-miniatura')).toHaveLength(2);
    expect(raiz().querySelector('.capas app-miniatura:last-of-type img')?.getAttribute('src')).toContain('agua');
  });

  it('si la misma noticia se actualiza, no duplica la foto', async () => {
    await mostrar();
    await mostrar({ resumen: 'Otro resumen' });
    expect(raiz().querySelectorAll('.capas app-miniatura')).toHaveLength(1);
  });

  it('tiñe la foto con la luz del momento: una capa por momento y solo una visible', async () => {
    await mostrar();
    const visibles = () => [...raiz().querySelectorAll('.tinte.visible')].map((capa) => capa.className);
    expect(raiz().querySelectorAll('.capas .tinte')).toHaveLength(4);
    expect(visibles()).toEqual([expect.stringContaining('tinte-dia')]);

    for (const momento of ['amanecer', 'atardecer', 'noche']) {
      fixture.componentRef.setInput('momento', momento);
      await fixture.whenStable();
      expect(visibles()).toEqual([expect.stringContaining(`tinte-${momento}`)]);
    }
  });

  it('los íconos son decorativos', async () => {
    await mostrar({ latitud: 4.34, longitud: -74.36 });
    const iconos = [...raiz().querySelectorAll('.contenido svg')];
    expect(iconos.length).toBeGreaterThan(0);
    expect(iconos.every((icono) => icono.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
