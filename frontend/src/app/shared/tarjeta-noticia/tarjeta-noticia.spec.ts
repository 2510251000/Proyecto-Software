import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Noticia } from '../../core/models/noticia.model';
import { TarjetaNoticia } from './tarjeta-noticia';

const NOTICIA: Noticia = {
  id: 1,
  titulo: 'Arreglan la vía principal',
  resumen: 'La alcaldía terminó las obras.',
  contenido: 'Contenido completo',
  fechaPublicacion: '2026-09-21T10:00:00',
  ciudad: 'Fusagasugá',
};

describe('TarjetaNoticia', () => {
  let fixture: ComponentFixture<TarjetaNoticia>;
  const raiz = () => fixture.nativeElement as HTMLElement;

  async function mostrar(noticia: Noticia): Promise<void> {
    fixture = TestBed.createComponent(TarjetaNoticia);
    fixture.componentRef.setInput('noticia', noticia);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarjetaNoticia] }).compileComponents();
  });

  it('muestra título, resumen, ciudad y la fecha en español', async () => {
    await mostrar(NOTICIA);
    const texto = raiz().textContent ?? '';
    expect(texto).toContain('Arreglan la vía principal');
    expect(texto).toContain('La alcaldía terminó las obras.');
    expect(texto).toContain('Fusagasugá');
    expect(texto).toContain('21 de septiembre de 2026');
  });

  it('marca la fecha con <time datetime>', async () => {
    await mostrar(NOTICIA);
    expect(raiz().querySelector('time')?.getAttribute('datetime')).toBe(NOTICIA.fechaPublicacion);
  });

  it('omite la fecha si no es válida', async () => {
    await mostrar({ ...NOTICIA, fechaPublicacion: 'no-es-fecha' });
    expect(raiz().querySelector('time')).toBeNull();
  });
});
