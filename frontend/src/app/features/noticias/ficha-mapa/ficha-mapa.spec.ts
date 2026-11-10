import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MAPA_MOSAICO,
  resumenMapa,
  TEXTOS_FICHA_MAPA,
} from '../../../core/constants/dia-en-vivo.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { FichaMapa } from './ficha-mapa';

let siguienteId = 1;

function noticia(ciudad: string, latitud?: number, longitud?: number): Noticia {
  return {
    id: siguienteId++,
    titulo: `Noticia de ${ciudad}`,
    resumen: '',
    contenido: '',
    fechaPublicacion: '2026-11-09T10:00:00-05:00',
    oficial: true,
    ciudad,
    latitud,
    longitud,
  };
}

const NOTICIAS: Noticia[] = [
  noticia('Fusagasugá', 4.34, -74.36),
  noticia('Fusagasugá', 4.34, -74.36),
  noticia('Fusagasugá', 4.34, -74.36),
  noticia('Soacha', 4.58, -74.22),
  noticia('Zipaquirá', 5.02, -74.0),
  noticia('Zipaquirá', 5.02, -74.0),
  noticia('Chía'),
];
const CONTEO = [
  { ciudad: 'Chía', cantidad: 1 },
  { ciudad: 'Fusagasugá', cantidad: 3 },
  { ciudad: 'Soacha', cantidad: 1 },
  { ciudad: 'Zipaquirá', cantidad: 2 },
];

describe('FichaMapa', () => {
  let fixture: ComponentFixture<FichaMapa>;
  let elegidas: (string | null)[];
  const raiz = () => fixture.nativeElement as HTMLElement;
  const limpio = (elemento: Element | null | undefined) =>
    elemento?.textContent?.replace(/\s+/g, ' ').trim();
  const puntos = () => [...raiz().querySelectorAll<HTMLButtonElement>('button.municipio')];
  const punto = (ciudad: string) =>
    puntos().find((p) => p.textContent?.includes(ciudad)) as HTMLButtonElement;

  async function mostrar(entradas: Record<string, unknown> = {}): Promise<void> {
    const todas = { noticias: NOTICIAS, conteo: CONTEO, ...entradas };
    for (const [nombre, valor] of Object.entries(todas)) {
      fixture.componentRef.setInput(nombre, valor);
    }
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaMapa],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(FichaMapa);
    elegidas = [];
    fixture.componentInstance.ciudad.subscribe((ciudad) => elegidas.push(ciudad));
  });

  it('dice cuántas noticias hay en cuántos municipios, bajo su título', async () => {
    await mostrar();
    expect(limpio(raiz().querySelector('.resumen'))).toBe('7 noticias en 4 municipios');
    expect(limpio(raiz().querySelector('h3'))).toBe(TEXTOS_FICHA_MAPA.titulo);
    const seccion = raiz().querySelector('section');
    expect(seccion?.getAttribute('aria-labelledby')).toBe(raiz().querySelector('h3')?.id);
  });

  it('el resumen cuida el singular', () => {
    expect(resumenMapa(1, 1)).toBe('1 noticia en 1 municipio');
    expect(resumenMapa(8, 4)).toBe('8 noticias en 4 municipios');
  });

  it('dibuja un punto por municipio con coordenadas, con su nombre y su cantidad', async () => {
    await mostrar();
    expect(puntos().map((p) => limpio(p))).toEqual([
      `Fusagasugá · 3 ${TEXTOS_FICHA_MAPA.noticias}`,
      `Zipaquirá · 2 ${TEXTOS_FICHA_MAPA.noticias}`,
      `Soacha · 1 ${TEXTOS_FICHA_MAPA.noticias}`,
    ]);
  });

  it('el punto crece con las noticias y su anillo es decorativo', async () => {
    await mostrar();
    const tamano = (ciudad: string) =>
      punto(ciudad).querySelector<HTMLElement>('.punto')?.style.width;
    expect(tamano('Fusagasugá')).toBe('20px');
    expect(tamano('Zipaquirá')).toBe('14px');
    expect(tamano('Soacha')).toBe('10px');
    expect(punto('Soacha').querySelector('.punto')?.getAttribute('aria-hidden')).toBe('true');
    expect(punto('Soacha').querySelector('.latido')).not.toBeNull();
  });

  it('pone el oeste a la izquierda y el norte arriba', async () => {
    await mostrar();
    expect(punto('Fusagasugá').style.left).toBe(`${MAPA_MOSAICO.margen}%`);
    expect(punto('Fusagasugá').style.top).toBe(`${100 - MAPA_MOSAICO.margen}%`);
    expect(punto('Zipaquirá').style.top).toBe(`${MAPA_MOSAICO.margen}%`);
  });

  it('cerca del borde derecho el nombre va a la izquierda del punto', async () => {
    await mostrar();
    expect(punto('Zipaquirá').classList).toContain('a-la-izquierda');
    expect(punto('Zipaquirá').style.right).toBe(`${MAPA_MOSAICO.margen}%`);
    expect(punto('Zipaquirá').style.left).toBe('');
    expect(punto('Fusagasugá').classList).not.toContain('a-la-izquierda');
  });

  it('cada punto late con un retraso distinto', async () => {
    await mostrar();
    const retrasos = puntos().map(
      (p) => p.querySelector<HTMLElement>('.latido')?.style.animationDelay,
    );
    expect(new Set(retrasos).size).toBe(3);
  });

  it('los municipios sin coordenadas van en una fila de píldoras', async () => {
    await mostrar();
    const grupo = raiz().querySelector('.sin-ubicacion');
    expect(grupo?.getAttribute('aria-label')).toBe(TEXTOS_FICHA_MAPA.sinUbicacion);
    expect([...(grupo?.querySelectorAll('button') ?? [])].map((b) => limpio(b))).toEqual([
      `Chía · 1 ${TEXTOS_FICHA_MAPA.noticias}`,
    ]);
  });

  it('si todos tienen coordenadas no deja la fila vacía', async () => {
    await mostrar({ noticias: NOTICIAS.slice(0, 6), conteo: CONTEO.slice(1) });
    expect(raiz().querySelector('.sin-ubicacion')).toBeNull();
  });

  it('resalta el municipio del usuario y dice que es el suyo', async () => {
    await mostrar({ municipioUsuario: 'Fusagasugá' });
    expect(punto('Fusagasugá').classList).toContain('tuyo');
    expect(limpio(punto('Fusagasugá'))).toBe(
      `Fusagasugá · 3 ${TEXTOS_FICHA_MAPA.noticias} · ${TEXTOS_FICHA_MAPA.tuMunicipio}`,
    );
    expect(punto('Soacha').classList).not.toContain('tuyo');
  });

  it('tocar un municipio filtra la portada y lo marca como activo', async () => {
    await mostrar();
    punto('Soacha').click();
    expect(elegidas).toEqual(['Soacha']);

    await mostrar({ ciudadActiva: 'Soacha' });
    expect(punto('Soacha').getAttribute('aria-pressed')).toBe('true');
    expect(punto('Fusagasugá').getAttribute('aria-pressed')).toBe('false');
  });

  it('tocar el municipio activo quita el filtro', async () => {
    await mostrar({ ciudadActiva: 'Soacha' });
    punto('Soacha').click();
    expect(elegidas).toEqual([null]);
  });

  it('una píldora sin coordenadas también filtra', async () => {
    await mostrar();
    raiz().querySelector<HTMLButtonElement>('.sin-ubicacion button')?.click();
    expect(elegidas).toEqual(['Chía']);
  });

  it('«Abrir el mapa completo» lleva a la pantalla Mapa', async () => {
    await mostrar();
    const enlace = raiz().querySelector('a.abrir');
    expect(enlace?.textContent).toContain(TEXTOS_FICHA_MAPA.abrir);
    expect(enlace?.getAttribute('href')).toBe(`/${RUTAS.mapa}`);
  });

  it('las curvas y los íconos son decorativos', async () => {
    await mostrar();
    const adornos = [...raiz().querySelectorAll('svg')];
    expect(adornos).toHaveLength(2);
    expect(adornos.every((a) => a.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('sin noticias no dibuja puntos', async () => {
    await mostrar({ noticias: [], conteo: [] });
    expect(puntos()).toHaveLength(0);
    expect(limpio(raiz().querySelector('.resumen'))).toBe('0 noticias en 0 municipios');
  });
});
