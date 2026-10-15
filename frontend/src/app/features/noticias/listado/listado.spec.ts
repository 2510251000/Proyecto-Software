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
import { simularDialogoNativo } from '../modal-noticia/dialogo-de-prueba';
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

  it('abre con la noticia más reciente en grande y las demás en su columna', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(buscar('app-apertura .principal')?.textContent).toContain('Primera noticia');
    expect(buscar('#columna-comunidad')?.closest('section')?.textContent).toContain('Segunda noticia');
    expect(buscar('app-columna-noticias')?.textContent).toContain(TEXTOS_PORTADA.sinOficiales);
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

  describe('vista rápida de una noticia', () => {
    const dialogo = () => buscar<HTMLDialogElement>('dialog') as HTMLDialogElement;

    beforeEach(async () => {
      simularDialogoNativo();
      respuesta.next(NOTICIAS);
      await fixture.whenStable();
    });

    it('las tarjetas son enlaces a la página de su noticia', () => {
      expect(buscar('app-apertura a.principal')?.getAttribute('href')).toBe('/noticias/1');
      expect(buscar('app-tarjeta-noticia a')?.getAttribute('href')).toBe('/noticias/2');
    });

    it('al hacer clic en una tarjeta se abre con esa noticia, sin pedir nada al backend', async () => {
      expect(dialogo().hasAttribute('open')).toBe(false);
      buscar<HTMLAnchorElement>('app-tarjeta-noticia a')?.click();
      await fixture.whenStable();
      expect(dialogo().hasAttribute('open')).toBe(true);
      expect(dialogo().textContent).toContain('Segunda noticia');
      expect(dialogo().textContent).toContain('Contenido dos');
      expect(listar).toHaveBeenCalledTimes(1);
    });

    it('al cerrarla queda vacía y se puede abrir otra', async () => {
      buscar<HTMLAnchorElement>('app-tarjeta-noticia a')?.click();
      await fixture.whenStable();
      buscar<HTMLButtonElement>('dialog button.cerrar')?.click();
      await fixture.whenStable();
      expect(dialogo().hasAttribute('open')).toBe(false);
      expect(dialogo().textContent?.trim()).toBe('');

      buscar<HTMLAnchorElement>('app-apertura a.principal')?.click();
      await fixture.whenStable();
      expect(dialogo().textContent).toContain('Contenido uno');
    });
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

    const columna = (id: string) => buscar(`#${id}`)?.closest('section') as HTMLElement;
    const notas = (id: string) => columna(id).querySelectorAll('app-tarjeta-noticia');
    const municipio = (texto: string) =>
      [...raiz().querySelectorAll<HTMLButtonElement>('.municipio')].find((boton) =>
        boton.textContent?.trim().startsWith(texto),
      ) as HTMLButtonElement;

    beforeEach(async () => {
      respuesta.next(MUCHAS);
      await fixture.whenStable();
    });

    it('cada columna muestra 6 y «Ver más» agrega 6 a cada una', async () => {
      expect(notas('columna-oficial')).toHaveLength(6);
      expect(notas('columna-comunidad')).toHaveLength(6);
      [...raiz().querySelectorAll<HTMLButtonElement>('button')]
        .find((boton) => boton.textContent?.includes(TEXTOS_PORTADA.verMas))
        ?.click();
      await fixture.whenStable();
      expect(notas('columna-oficial')).toHaveLength(12);
      expect(notas('columna-comunidad')).toHaveLength(12);
    });

    it('separa lo oficial de lo de la comunidad y no repite la principal', () => {
      expect(buscar('app-apertura')?.textContent).toContain('Noticia 1');
      expect(columna('columna-oficial').textContent).toContain('Noticia 3');
      expect(columna('columna-oficial').textContent).not.toContain('Noticia 2');
      expect(columna('columna-comunidad').textContent).toContain('Noticia 2');
      expect(raiz().querySelectorAll('a[href="/noticias/1"]')).toHaveLength(1);
    });

    it('la cabecera tiene «Todos» y un municipio por ciudad, en orden alfabético y con su cantidad', () => {
      const textos = [...raiz().querySelectorAll('.municipio')].map((b) =>
        b.textContent?.replace(/\s+/g, ' ').trim(),
      );
      expect(textos).toEqual(['Todos 30', 'Fusagasugá 10', 'Soacha 10', 'Zipaquirá 10']);
      expect(municipio('Todos').getAttribute('aria-pressed')).toBe('true');
      expect(municipio('Soacha').type).toBe('button');
      expect(buscar('h1')?.textContent).toContain(TEXTOS_PORTADA.tuRegion);
    });

    it('al elegir un municipio su nombre es el titular y solo quedan sus noticias', async () => {
      municipio('Soacha').click();
      await fixture.whenStable();
      expect(municipio('Soacha').getAttribute('aria-pressed')).toBe('true');
      expect(municipio('Todos').getAttribute('aria-pressed')).toBe('false');
      expect(buscar('h1')?.textContent).toContain('Soacha');
      const datos = [...raiz().querySelectorAll('app-apertura .datos, app-tarjeta-noticia .datos')];
      expect(datos.length).toBeGreaterThan(0);
      for (const dato of datos) {
        expect(dato.textContent).toContain('Soacha');
      }

      municipio('Todos').click();
      await fixture.whenStable();
      expect(buscar('h1')?.textContent).toContain(TEXTOS_PORTADA.tuRegion);
    });

    it('no muestra el cintillo si ninguna noticia es de última hora', () => {
      expect(buscar('app-cintillo')).toBeNull();
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
