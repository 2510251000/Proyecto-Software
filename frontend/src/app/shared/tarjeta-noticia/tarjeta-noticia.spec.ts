import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { Noticia } from '../../core/models/noticia.model';
import { TarjetaNoticia, VarianteTarjeta } from './tarjeta-noticia';

// Dos días antes de la fecha de publicación: la hora relativa es fija en las pruebas.
const AHORA = new Date('2026-09-23T10:00:00');

const NOTICIA: Noticia = {
  id: 1,
  titulo: 'Arreglan la vía principal',
  resumen: 'La alcaldía terminó las obras.',
  contenido: 'Contenido completo',
  fechaPublicacion: '2026-09-21T10:00:00',
  oficial: false,
  ciudad: 'Fusagasugá',
};

describe('TarjetaNoticia', () => {
  let fixture: ComponentFixture<TarjetaNoticia>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = (selector: string) => raiz().querySelector(selector);

  async function mostrar(noticia: Noticia, variante: VarianteTarjeta = 'compacta'): Promise<void> {
    fixture = TestBed.createComponent(TarjetaNoticia);
    fixture.componentRef.setInput('noticia', noticia);
    fixture.componentRef.setInput('variante', variante);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(AHORA);
    await TestBed.configureTestingModule({ imports: [TarjetaNoticia] }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('la grande muestra título, resumen, ciudad y la hora relativa en español', async () => {
    await mostrar(NOTICIA, 'grande');
    const texto = raiz().textContent ?? '';
    expect(texto).toContain('Arreglan la vía principal');
    expect(texto).toContain('La alcaldía terminó las obras.');
    expect(texto).toContain('Fusagasugá');
    expect(texto).toContain('anteayer');
  });

  it('marca la fecha con <time datetime> y deja la fecha completa como descripción', async () => {
    await mostrar(NOTICIA);
    const hora = buscar('time');
    expect(hora?.getAttribute('datetime')).toBe(NOTICIA.fechaPublicacion);
    expect(hora?.getAttribute('title')).toBe('21 de septiembre de 2026');
  });

  it('omite la fecha si no es válida', async () => {
    await mostrar({ ...NOTICIA, fechaPublicacion: 'no-es-fecha' });
    expect(buscar('time')).toBeNull();
  });

  it('muestra la foto según la categoría del titular', async () => {
    await mostrar({ ...NOTICIA, titulo: 'Nueva ciclorruta en el centro' });
    expect(buscar('app-miniatura img')?.getAttribute('src')).toMatch(/\/bici\.webp$/);
  });

  it('una noticia sin urgencia no lleva «Última hora»', async () => {
    await mostrar({ ...NOTICIA, oficial: true });
    expect(buscar('.etiqueta-urgente')).toBeNull();
  });

  it('una noticia oficial de hace menos de tres horas lleva «Última hora»', async () => {
    await mostrar({ ...NOTICIA, oficial: true, fechaPublicacion: '2026-09-23T08:30:00' });
    expect(buscar('.etiqueta-urgente')?.textContent).toContain(ETIQUETAS_NOTICIA.ultimaHora);
  });

  it('la compacta no lleva resumen y tiene la miniatura pequeña', async () => {
    await mostrar(NOTICIA);
    expect(raiz().textContent).not.toContain(NOTICIA.resumen);
    expect(buscar('.nota')?.classList).not.toContain('grande');
    expect(buscar('.datos')?.textContent?.trim()).toBe('Fusagasugá');
    expect(buscar('.avatar')).toBeNull();
  });

  it('un vecino lleva sus iniciales sobre ámbar y «Nivel N»', async () => {
    await mostrar({ ...NOTICIA, autor: 'Carlos Activo', autorNivel: 2 }, 'grande');
    expect(buscar('.avatar')?.textContent?.trim()).toBe('CA');
    expect(buscar('.nombre')?.textContent?.trim()).toBe('Carlos Activo');
    expect(buscar('.etiqueta')?.textContent?.trim()).toBe(`${ETIQUETAS_NOTICIA.etiquetaNivel} 2`);
  });

  it('una oficial lleva el edificio sobre azul y la etiqueta «Oficial»', async () => {
    await mostrar({ ...NOTICIA, oficial: true, autorNivel: 3 }, 'grande');
    expect(buscar('.avatar-oficial svg')).not.toBeNull();
    expect(buscar('.etiqueta-oficial')?.textContent).toContain(ETIQUETAS_NOTICIA.oficial);
    expect(buscar('.nombre')?.textContent?.trim()).toBe(ETIQUETAS_NOTICIA.autorOficial);
  });

  it('la grande lleva el municipio, los minutos de lectura y, si la han calificado, el promedio', async () => {
    await mostrar(NOTICIA, 'grande');
    expect(buscar('.municipio')?.textContent?.trim()).toBe('Fusagasugá');
    expect(buscar('.datos')?.textContent).toContain(`1 ${ETIQUETAS_NOTICIA.minutos} ${ETIQUETAS_NOTICIA.deLectura}`);
    expect(buscar('.calificacion')).toBeNull();

    await mostrar({ ...NOTICIA, promedio: 4.25, cantidadCalificaciones: 12 }, 'grande');
    const calificacion = buscar('.calificacion')?.textContent?.replace(/\s+/g, ' ').trim();
    expect(calificacion).toBe(`4,3 ${ETIQUETAS_NOTICIA.deCinco}, (12 ${ETIQUETAS_NOTICIA.calificaciones})`);
  });
});
