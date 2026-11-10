import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  anuncioHora,
  ARCO,
  etiquetaMarca,
  GUIAS_ARCO,
  TEXTOS_LINEA_SOL,
} from '../../../core/constants/dia-en-vivo.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { MarcaArco, marcasDelDia } from '../../../core/utils/dia-en-vivo';
import { LineaSol } from './linea-sol';

const DIA = '2026-11-09';

function noticia(id: number, hora: string): Noticia {
  return {
    id,
    titulo: `Noticia ${id}`,
    resumen: '',
    contenido: '',
    fechaPublicacion: `${DIA}T${hora}:00-05:00`,
    oficial: true,
    ciudad: 'Fusagasugá',
  };
}

const MARCAS: MarcaArco[] = marcasDelDia([noticia(1, '09:00'), noticia(2, '12:00'), noticia(3, '15:00')], DIA);

describe('LineaSol', () => {
  let fixture: ComponentFixture<LineaSol>;
  let elegidas: number[];
  const raiz = () => fixture.nativeElement as HTMLElement;
  const rango = () => raiz().querySelector<HTMLInputElement>('input[type="range"]') as HTMLInputElement;
  const marcas = () => [...raiz().querySelectorAll<HTMLButtonElement>('button.marca')];
  const anuncio = () => raiz().querySelector('[aria-live]')?.textContent?.trim();

  async function mostrar(entradas: Record<string, unknown>): Promise<void> {
    for (const [nombre, valor] of Object.entries(entradas)) {
      fixture.componentRef.setInput(nombre, valor);
    }
    await fixture.whenStable();
  }

  /** Mueve el deslizador como lo hace el navegador: «input» al arrastrar y «change» al soltar. */
  async function arrastrar(minutos: number, soltar = true): Promise<void> {
    rango().value = String(minutos);
    rango().dispatchEvent(new Event('input'));
    // Quien la usa responde con la hora nueva.
    await mostrar({ hora: elegidas.at(-1) });
    if (soltar) {
      rango().dispatchEvent(new Event('change'));
      await fixture.whenStable();
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LineaSol] }).compileComponents();
    fixture = TestBed.createComponent(LineaSol);
    elegidas = [];
    fixture.componentInstance.elegida.subscribe((hora) => elegidas.push(hora));
    await mostrar({ hora: 12, marcas: MARCAS, idActiva: 2, titular: 'Noticia 2' });
  });

  it('pone el sol en la hora que se está viendo', () => {
    const sol = raiz().querySelector<HTMLElement>('.sol');
    expect(sol?.style.left).toBe('50%');
    expect(sol?.style.top).toBe(`${ARCO.tope}px`);
    expect(sol?.getAttribute('aria-hidden')).toBe('true');
  });

  it('después de las 6 p. m. el sol se queda en las 6 p. m.', async () => {
    await mostrar({ hora: 21 });
    expect(raiz().querySelector<HTMLElement>('.sol')?.style.left).toBe(`${ARCO.xInicio + ARCO.ancho}%`);
  });

  it('cuelga una marca por noticia, con su hora y su nombre para lectores de pantalla', () => {
    expect(marcas()).toHaveLength(3);
    expect(marcas().map((m) => m.querySelector('.pildora')?.textContent?.trim())).toEqual([
      '9:00 a. m.',
      '12:00 p. m.',
      '3:00 p. m.',
    ]);
    expect(marcas()[0].getAttribute('aria-label')).toBe(etiquetaMarca('9:00 a. m.', 'Noticia 1'));
    expect(marcas()[1].style.left).toBe('50%');
  });

  it('resalta solo la marca de la noticia que está en portada', () => {
    expect(marcas().map((m) => m.classList.contains('activa'))).toEqual([false, true, false]);
    expect(marcas()[1].getAttribute('aria-current')).toBe('true');
    expect(marcas()[0].getAttribute('aria-current')).toBeNull();
  });

  it('al tocar una marca elige exactamente la hora de esa noticia', () => {
    marcas()[2].click();
    expect(elegidas).toEqual([15]);
  });

  it('el deslizador es nativo, va de las 6 a. m. a la hora máxima en pasos de un minuto', async () => {
    await mostrar({ maximo: 17.5 });
    expect(rango().min).toBe('360');
    expect(rango().max).toBe('1050');
    expect(rango().step).toBe('1');
    expect(rango().value).toBe('720');
    expect(rango().disabled).toBe(false);
  });

  it('tiene etiqueta y dice la hora en palabras', () => {
    expect(raiz().querySelector(`label[for="${rango().id}"]`)?.textContent).toContain(TEXTOS_LINEA_SOL.deslizador);
    expect(rango().getAttribute('aria-valuetext')).toBe('12:00 p. m.');
  });

  it('al arrastrar avisa la hora elegida', async () => {
    await arrastrar(630);
    expect(elegidas).toEqual([10.5]);
    expect(rango().getAttribute('aria-valuetext')).toBe('10:30 a. m.');
  });

  it('anuncia la hora y el titular solo al soltar, no en cada movimiento', async () => {
    expect(anuncio()).toBe('');
    await arrastrar(600, false);
    await arrastrar(630, false);
    expect(anuncio()).toBe('');

    rango().dispatchEvent(new Event('change'));
    await mostrar({ titular: 'Noticia 1' });
    expect(anuncio()).toBe(anuncioHora('10:30 a. m.', 'Noticia 1'));

    await arrastrar(700, false);
    expect(anuncio()).toBe('');
  });

  it('el riel llega solo hasta la hora máxima', async () => {
    await mostrar({ maximo: 12 });
    expect(rango().style.getPropertyValue('--riel')).toBe(`${ARCO.ancho / 2}%`);
    expect(rango().style.getPropertyValue('--inicio')).toBe(`${ARCO.xInicio}%`);
  });

  it('antes de las 6 a. m. no hay nada que recorrer: queda desactivado', async () => {
    await mostrar({ hora: 3, maximo: 3 });
    expect(rango().disabled).toBe(true);
  });

  it('escribe las cinco horas de guía, solo para la vista', () => {
    const guias = [...raiz().querySelectorAll<HTMLElement>('.guia')];
    expect(guias.map((g) => g.textContent?.trim())).toEqual(GUIAS_ARCO.map((g) => g.texto));
    expect(guias.map((g) => g.style.left)).toEqual(['8%', '29%', '50%', '71%', '92%']);
    expect(guias.every((g) => g.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('un día sin noticias sale sin marcas', async () => {
    await mostrar({ marcas: [], idActiva: null });
    expect(marcas()).toHaveLength(0);
  });

  it('el arco, el sol y las montañas son decorativos', () => {
    const adornos = [...raiz().querySelectorAll('svg, .sol, .plomada')];
    expect(adornos).toHaveLength(4);
    expect(adornos.every((a) => a.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
