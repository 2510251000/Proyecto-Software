import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { TEXTOS_COLUMNA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Notificacion } from '../../../core/models/notificacion.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { avisosFalsos } from '../../../../testing/menu-falso';
import { AvisosCerca } from './avisos-cerca';

function aviso(id: number, tipo: Notificacion['tipo'], leida = false, noticiaId: number | null = id): Notificacion {
  return { id, tipo, mensaje: `Aviso ${id}`, noticiaId, leida, fecha: new Date().toISOString() };
}

// Estas pruebas vienen de la columna derecha de la portada, donde vivía «Avisos cerca de ti».
describe('AvisosCerca', () => {
  let fixture: ComponentFixture<AvisosCerca>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const enlaces = () => [...raiz().querySelectorAll<HTMLAnchorElement>('a.renglon-lateral')];

  async function crear(avisos: Notificacion[] = []): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [AvisosCerca],
      providers: [provideRouter([]), avisosFalsos(avisos)],
    }).compileComponents();
    fixture = TestBed.createComponent(AvisosCerca);
    await fixture.whenStable();
  }

  it('muestra hasta dos avisos de cercanía sin leer y cuenta todos', async () => {
    await crear([
      aviso(1, 'CERCANIA'),
      aviso(2, 'COMENTARIO'),
      aviso(3, 'CERCANIA', true),
      aviso(4, 'CERCANIA'),
      aviso(5, 'CERCANIA', false, null),
    ]);
    expect(enlaces().map((a) => a.querySelector('.renglon-titulo')?.textContent)).toEqual(['Aviso 1', 'Aviso 4']);
    expect(enlaces()[0].getAttribute('href')).toBe(`/${RUTAS.noticias}/1`);
    expect(texto('.contador')).toBe(`3 ${TEXTOS_COLUMNA.sinLeer}`);
  });

  it('un aviso sin noticia lleva a la bandeja de avisos', async () => {
    await crear([aviso(5, 'CERCANIA', false, null)]);
    expect(enlaces()[0].getAttribute('href')).toBe(`/${RUTAS.notificaciones}`);
  });

  it('cada aviso dice hace cuánto llegó', async () => {
    await crear([aviso(1, 'CERCANIA')]);
    expect(raiz().querySelector('time')?.getAttribute('datetime')).toBeTruthy();
    expect(texto('time')).toBeTruthy();
  });

  it('sin avisos nuevos lo dice y no muestra contador', async () => {
    await crear([aviso(1, 'CERCANIA', true)]);
    expect(texto('.vacio')).toBe(TEXTOS_COLUMNA.sinAvisos);
    expect(raiz().querySelector('.contador')).toBeNull();
  });

  it('si la bandeja no carga, dice que no hay avisos nuevos', async () => {
    await TestBed.configureTestingModule({
      imports: [AvisosCerca],
      providers: [
        provideRouter([]),
        { provide: NotificacionService, useValue: { listar: () => throwError(() => new Error('sin red')) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AvisosCerca);
    await fixture.whenStable();
    expect(texto('.vacio')).toBe(TEXTOS_COLUMNA.sinAvisos);
  });

  it('tiene su título', async () => {
    await crear();
    expect(texto('h2')).toBe(TEXTOS_COLUMNA.avisos);
  });
});
