import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MENSAJES_ERROR_HTTP, TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { ETIQUETAS_PESTANA, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { ETIQUETAS_NOTICIA, TEXTOS_BIENVENIDA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Noticia } from '../../../core/models/noticia.model';
import { AuthService } from '../../../core/services/auth.service';
import { NoticiaService } from '../../../core/services/noticia.service';
import { simularDialogoNativo } from '../modal-noticia/dialogo-de-prueba';
import { avisosFalsos, campanaFalsa, perfilFalso } from '../../../../testing/menu-falso';
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
  const destacadas = () => [...raiz().querySelectorAll('[aria-labelledby="titulo-destacadas"] app-tarjeta-noticia')];
  const enlaces = () => [...raiz().querySelectorAll<HTMLAnchorElement>('app-tarjeta-noticia a')];

  beforeEach(async () => {
    respuesta = new Subject<Noticia[]>();
    listar = vi.fn(() => respuesta);
    cerrarSesion = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Listado],
      providers: [
        provideRouter([]),
        { provide: NoticiaService, useValue: { listar } },
        { provide: AuthService, useValue: { cerrarSesion, obtenerContenidoToken: () => null } },
        campanaFalsa(),
        perfilFalso(),
        avisosFalsos(),
      ],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Listado);
    await fixture.whenStable();
  });

  it('muestra el nombre del portal y pide las noticias al abrir', () => {
    expect(buscar('aside')?.textContent).toContain('Al Día');
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado de carga mientras espera', () => {
    expect(buscar('[role="status"]')?.textContent).toContain(TEXTOS_COMUNES.cargando);
    expect(buscar('app-esqueleto-portada')).not.toBeNull();
    expect(buscar('app-tarjeta-noticia')).toBeNull();
  });

  it('las dos primeras van en grande en «Nuevas y recomendadas»', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    const grandes = destacadas();
    expect(buscar('#titulo-destacadas')?.textContent).toContain(TEXTOS_PORTADA.destacadas);
    expect(grandes).toHaveLength(2);
    expect(grandes[0].textContent).toContain('Primera noticia');
    expect(grandes[1].textContent).toContain('Segunda noticia');
    expect(buscar('#titulo-region')).toBeNull();
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
    expect(destacadas()[0].textContent).toContain('Primera noticia');
  });

  describe('vista rápida de una noticia', () => {
    const dialogo = () => buscar<HTMLDialogElement>('dialog') as HTMLDialogElement;

    beforeEach(async () => {
      simularDialogoNativo();
      respuesta.next(NOTICIAS);
      await fixture.whenStable();
    });

    it('las tarjetas son enlaces a la página de su noticia', () => {
      expect(enlaces().map((a) => a.getAttribute('href'))).toEqual(['/noticias/1', '/noticias/2']);
    });

    it('al hacer clic en una tarjeta se abre con esa noticia, sin pedir nada al backend', async () => {
      expect(dialogo().hasAttribute('open')).toBe(false);
      enlaces()[1].click();
      await fixture.whenStable();
      expect(dialogo().hasAttribute('open')).toBe(true);
      expect(dialogo().textContent).toContain('Segunda noticia');
      expect(dialogo().textContent).toContain('Contenido dos');
      expect(listar).toHaveBeenCalledTimes(1);
    });

    it('al cerrarla queda vacía y se puede abrir otra', async () => {
      enlaces()[1].click();
      await fixture.whenStable();
      buscar<HTMLButtonElement>('dialog button.cerrar')?.click();
      await fixture.whenStable();
      expect(dialogo().hasAttribute('open')).toBe(false);
      expect(dialogo().textContent?.trim()).toBe('');

      enlaces()[0].click();
      await fixture.whenStable();
      expect(dialogo().textContent).toContain('Contenido uno');
    });
  });

  it('la búsqueda la hace el backend con la palabra escrita', async () => {
    const entrada = buscar<HTMLInputElement>('#busqueda-noticias') as HTMLInputElement;
    entrada.value = 'feria';
    entrada.dispatchEvent(new Event('input'));
    buscar<HTMLFormElement>('form[role="search"]')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(listar).toHaveBeenLastCalledWith({ orden: 'RECOMENDADAS', texto: 'feria' });
  });

  it('el filtro «Comunidad» deja solo lo que cuentan los vecinos', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    const comunidad = [...raiz().querySelectorAll<HTMLButtonElement>('.pestana')].find((b) =>
      b.textContent?.includes('Comunidad'),
    );
    comunidad?.click();
    await fixture.whenStable();
    expect(destacadas()).toHaveLength(1);
    expect(destacadas()[0].textContent).toContain('Segunda noticia');
    expect(buscar('main')?.textContent).not.toContain('Primera noticia');
  });

  it('cierra la sesión y vuelve al login', () => {
    buscar<HTMLButtonElement>('.salir')?.click();
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

    const compactas = () => [...raiz().querySelectorAll('.compactas app-tarjeta-noticia')];
    const selector = () => buscar<HTMLSelectElement>('#municipio-portada') as HTMLSelectElement;
    async function elegirMunicipio(valor: string): Promise<void> {
      selector().value = valor;
      selector().dispatchEvent(new Event('change'));
      await fixture.whenStable();
    }

    beforeEach(async () => {
      respuesta.next(MUCHAS);
      await fixture.whenStable();
    });

    it('«Más de tu región» muestra 6 compactas y «Ver más» agrega 6', async () => {
      expect(buscar('#titulo-region')?.textContent).toContain(TEXTOS_PORTADA.masDeTuRegion);
      expect(compactas()).toHaveLength(6);
      [...raiz().querySelectorAll<HTMLButtonElement>('button')]
        .find((boton) => boton.textContent?.includes(TEXTOS_PORTADA.verMas))
        ?.click();
      await fixture.whenStable();
      expect(compactas()).toHaveLength(12);
    });

    it('respeta el orden de la API y no repite las destacadas abajo', () => {
      expect(destacadas().map((t) => t.querySelector('h3')?.textContent?.trim())).toEqual(['Noticia 1', 'Noticia 2']);
      expect(compactas()[0].textContent).toContain('Noticia 3');
      expect(raiz().querySelectorAll('main a[href="/noticias/1"]')).toHaveLength(1);
    });

    it('«Recientes» ordena por fecha sin pedir nada nuevo al backend', async () => {
      // Se invierte el orden de la API: la más nueva (Noticia 1) llega al final.
      respuesta.next([...MUCHAS].reverse());
      await fixture.whenStable();
      expect(destacadas()[0].textContent).toContain('Noticia 30');
      raiz().querySelectorAll<HTMLButtonElement>('.pestana')[1].click();
      await fixture.whenStable();
      expect(destacadas()[0].textContent).toContain('Noticia 1');
      expect(listar).toHaveBeenCalledTimes(1);
    });

    it('el selector tiene «Todos los municipios» y un municipio por ciudad, en orden alfabético y con su cantidad', () => {
      const textos = [...selector().options].map((opcion) => opcion.textContent?.replace(/\s+/g, ' ').trim());
      expect(textos).toEqual([
        `${TEXTOS_BUSQUEDA.todosMunicipios} (30)`,
        'Fusagasugá (10)',
        'Soacha (10)',
        'Zipaquirá (10)',
      ]);
      expect(selector().value).toBe('');
    });

    it('al elegir un municipio solo quedan sus noticias, y «Todos» las devuelve', async () => {
      await elegirMunicipio('Soacha');
      expect(selector().value).toBe('Soacha');
      expect(buscar('h1')?.textContent).toContain('Soacha');
      const datos = [...raiz().querySelectorAll('app-tarjeta-noticia .datos')];
      expect(datos.length).toBeGreaterThan(0);
      for (const dato of datos) {
        expect(dato.textContent).toContain('Soacha');
      }

      await elegirMunicipio('');
      expect(raiz().textContent).toContain('Zipaquirá');
      expect(buscar('h1')?.textContent).toContain(TEXTOS_BIENVENIDA.tuMunicipio);
    });

    it('la pestaña activa es una sola y lo anuncia con aria-current', async () => {
      const pestanas = () => [...raiz().querySelectorAll<HTMLButtonElement>('.pestana')];
      expect(pestanas().map((p) => p.textContent?.trim())).toEqual(Object.values(ETIQUETAS_PESTANA));
      expect(pestanas().filter((p) => p.getAttribute('aria-current') === 'true')).toHaveLength(1);
      pestanas()[1].click();
      await fixture.whenStable();
      expect(pestanas()[1].getAttribute('aria-current')).toBe('true');
      expect(pestanas()[0].getAttribute('aria-current')).toBeNull();
    });

    it('sin «Última hora» no aparece la etiqueta roja', () => {
      expect(buscar('.etiqueta-urgente')).toBeNull();
    });
  });

  it('si el municipio y la pestaña no dejan ninguna noticia, lo dice', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    // En Soacha solo está la «Segunda noticia», que es de la comunidad.
    const selector = buscar<HTMLSelectElement>('#municipio-portada') as HTMLSelectElement;
    selector.value = 'Soacha';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    raiz().querySelectorAll<HTMLButtonElement>('.pestana')[2].click();
    await fixture.whenStable();
    expect(destacadas()).toHaveLength(0);
    expect(raiz().textContent).toContain(TEXTOS_PORTADA.sinFiltro);
  });

  it('una noticia oficial de hace menos de tres horas lleva la etiqueta «Última hora»', async () => {
    const reciente: Noticia = {
      ...NOTICIAS[0],
      id: 99,
      titulo: 'Se cae el puente peatonal',
      fechaPublicacion: new Date(Date.now() - 30 * 60_000).toISOString(),
    };
    respuesta.next([reciente, ...NOTICIAS]);
    await fixture.whenStable();
    expect(destacadas()[0].textContent).toContain('Se cae el puente peatonal');
    expect(destacadas()[0].querySelector('.etiqueta-urgente')?.textContent).toContain(ETIQUETAS_NOTICIA.ultimaHora);
  });
});
