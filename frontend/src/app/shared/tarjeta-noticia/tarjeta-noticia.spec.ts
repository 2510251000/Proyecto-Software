import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { Noticia } from '../../core/models/noticia.model';
import { TarjetaNoticia } from './tarjeta-noticia';

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

  async function mostrar(noticia: Noticia): Promise<void> {
    fixture = TestBed.createComponent(TarjetaNoticia);
    fixture.componentRef.setInput('noticia', noticia);
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

  it('muestra título, resumen, ciudad y la hora relativa en español', async () => {
    await mostrar(NOTICIA);
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
    expect(buscar('.urgente')).toBeNull();
  });

  it('una noticia oficial de hace menos de tres horas lleva «Última hora»', async () => {
    await mostrar({ ...NOTICIA, oficial: true, fechaPublicacion: '2026-09-23T08:30:00' });
    expect(buscar('.urgente')?.textContent).toContain(ETIQUETAS_NOTICIA.ultimaHora);
  });

  it('lleva la sección de la noticia encima del titular', async () => {
    await mostrar({ ...NOTICIA, titulo: 'Nueva ciclorruta en el centro' });
    expect(buscar('.seccion')?.textContent).toContain('Movilidad');
  });
});
