import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MENSAJES_ERROR_HTTP, TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Noticia } from '../../../core/models/noticia.model';
import { AuthService } from '../../../core/services/auth.service';
import { NoticiaService } from '../../../core/services/noticia.service';
import { Listado } from './listado';

const NOTICIAS: Noticia[] = [
  {
    id: 1,
    titulo: 'Primera noticia',
    resumen: 'Resumen uno',
    contenido: 'Contenido uno',
    fechaPublicacion: '2026-09-21T10:00:00',
    oficial: true,
    ciudad: 'Fusagasugá',
  },
  {
    id: 2,
    titulo: 'Segunda noticia',
    resumen: 'Resumen dos',
    contenido: 'Contenido dos',
    fechaPublicacion: '2026-09-20T08:00:00',
    oficial: false,
    ciudad: 'Soacha',
  },
];

describe('Listado', () => {
  let fixture: ComponentFixture<Listado>;
  let respuesta: Subject<Noticia[]>;
  let listar: ReturnType<typeof vi.fn>;
  let cerrarSesion: ReturnType<typeof vi.fn>;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);

  beforeEach(async () => {
    respuesta = new Subject<Noticia[]>();
    listar = vi.fn(() => respuesta);
    cerrarSesion = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Listado],
      providers: [
        provideRouter([]),
        { provide: NoticiaService, useValue: { listar } },
        { provide: AuthService, useValue: { cerrarSesion } },
      ],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Listado);
    await fixture.whenStable();
  });

  it('muestra el nombre del portal y pide las noticias al abrir', () => {
    expect(buscar('header')?.textContent).toContain('Al Día');
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado de carga mientras espera', () => {
    expect(buscar('[role="status"]')?.textContent).toContain(TEXTOS_COMUNES.cargando);
    expect(buscar('app-esqueleto-portada')).not.toBeNull();
    expect(buscar('app-tarjeta-noticia')).toBeNull();
  });

  it('abre con la noticia más reciente en grande y la siguiente al lado', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(buscar('app-apertura .principal')?.textContent).toContain('Primera noticia');
    expect(buscar('app-apertura app-tarjeta-noticia')?.textContent).toContain('Segunda noticia');
    expect(raiz().textContent).toContain('Soacha');
    expect(buscar('[role="status"]')).toBeNull();
  });

  it('avisa cuando no hay noticias', async () => {
    respuesta.next([]);
    await fixture.whenStable();
    expect(raiz().textContent).toContain('Todavía no hay noticias publicadas.');
  });

  it('muestra el error y permite reintentar', async () => {
    const error: ErrorApi = { estado: 403, mensaje: MENSAJES_ERROR_HTTP.generico };
    respuesta.error(error);
    await fixture.whenStable();
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_ERROR_HTTP.generico);

    respuesta = new Subject<Noticia[]>();
    buscar<HTMLButtonElement>('[role="alert"] button')?.click();
    await fixture.whenStable();
    expect(listar).toHaveBeenCalledTimes(2);
    expect(buscar('[role="alert"]')).toBeNull();

    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(buscar('app-apertura')?.textContent).toContain('Primera noticia');
  });

  it('cierra la sesión y vuelve al login', () => {
    buscar<HTMLButtonElement>('header button')?.click();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login]);
  });

  describe('portada con muchas noticias', () => {
    const CIUDADES = ['Soacha', 'Fusagasugá', 'Zipaquirá'];
    // 30 noticias de hace 1, 2, 3… días: ninguna es «Última hora». Las pares son oficiales.
    const MUCHAS: Noticia[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      titulo: `Noticia ${i + 1}`,
      resumen: `Resumen ${i + 1}`,
      contenido: 'Contenido',
      fechaPublicacion: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
      oficial: i % 2 === 0,
      ciudad: CIUDADES[i % CIUDADES.length],
    }));

    const rejillaCiudad = () =>
      raiz().querySelectorAll('app-franja-seccion:first-of-type .rejilla app-tarjeta-noticia');
    const chip = (texto: string) =>
      [...raiz().querySelectorAll<HTMLButtonElement>('.chip')].find(
        (boton) => boton.textContent?.trim() === texto,
      ) as HTMLButtonElement;
    const botonConTexto = (texto: string) =>
      [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((boton) =>
        boton.textContent?.includes(texto),
      ) as HTMLButtonElement;

    beforeEach(async () => {
      respuesta.next(MUCHAS);
      await fixture.whenStable();
    });

    it('muestra 12 (4 en la apertura y 8 en la rejilla) y «Ver más» agrega 12', async () => {
      expect(raiz().querySelectorAll('app-apertura app-tarjeta-noticia')).toHaveLength(3);
      expect(rejillaCiudad()).toHaveLength(8);
      botonConTexto(TEXTOS_PORTADA.verMas).click();
      await fixture.whenStable();
      expect(rejillaCiudad()).toHaveLength(20);
    });

    it('tiene chips fijos y uno por ciudad, en orden alfabético', () => {
      const textos = [...raiz().querySelectorAll('.chip')].map((c) => c.textContent?.trim());
      expect(textos).toEqual([
        'Todas',
        'Última hora',
        'Oficiales',
        'Comunidad',
        'Fusagasugá',
        'Soacha',
        'Zipaquirá',
      ]);
      expect(chip('Todas').getAttribute('aria-pressed')).toBe('true');
      expect(chip('Soacha').type).toBe('button');
    });

    it('al elegir una ciudad solo quedan noticias de esa ciudad', async () => {
      chip('Soacha').click();
      await fixture.whenStable();
      expect(chip('Soacha').getAttribute('aria-pressed')).toBe('true');
      expect(chip('Todas').getAttribute('aria-pressed')).toBe('false');
      const ciudades = [...raiz().querySelectorAll('app-apertura .datos, .rejilla .ciudad')];
      expect(ciudades.length).toBeGreaterThan(0);
      for (const ciudad of ciudades.slice(0, 5)) {
        expect(ciudad.textContent).toContain('Soacha');
      }
    });

    it('si el filtro no deja nada, lo dice y permite volver a ver todas', async () => {
      chip('Última hora').click();
      await fixture.whenStable();
      expect(raiz().textContent).toContain(TEXTOS_PORTADA.sinResultados);
      botonConTexto(TEXTOS_PORTADA.verTodas).click();
      await fixture.whenStable();
      expect(chip('Todas').getAttribute('aria-pressed')).toBe('true');
    });

    it('no muestra el cintillo si ninguna noticia es de última hora', () => {
      expect(buscar('app-cintillo')).toBeNull();
    });

    it('la franja de la comunidad solo trae noticias de la comunidad', () => {
      const franja = raiz().querySelectorAll('app-franja-seccion')[1];
      expect(franja.textContent).toContain(TEXTOS_PORTADA.comunidad);
      expect(franja.querySelectorAll('app-tarjeta-noticia')).toHaveLength(3);
      expect(franja.textContent).toContain('Noticia 2');
      expect(franja.textContent).not.toContain('Noticia 1 ');
    });

    it('el lateral lista las más recientes y cuenta las noticias por ciudad', () => {
      const lateral = buscar('app-lateral') as HTMLElement;
      expect(lateral.textContent).toContain(TEXTOS_PORTADA.recientes);
      expect(lateral.querySelectorAll('.recientes li')).toHaveLength(5);
      expect(lateral.textContent).toContain('10 noticias');
    });
  });

  it('muestra el cintillo cuando hay una noticia oficial de hace menos de tres horas', async () => {
    const reciente: Noticia = {
      ...NOTICIAS[0],
      id: 99,
      titulo: 'Se cae el puente peatonal',
      fechaPublicacion: new Date(Date.now() - 30 * 60_000).toISOString(),
    };
    respuesta.next([reciente, ...NOTICIAS]);
    await fixture.whenStable();
    expect(buscar('app-cintillo')?.textContent).toContain('Se cae el puente peatonal');
  });
});
