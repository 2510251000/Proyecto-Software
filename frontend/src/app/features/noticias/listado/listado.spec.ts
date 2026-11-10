import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { anuncioHora, INTERVALO_RELOJ_MS, TEXTOS_RELOJ } from '../../../core/constants/dia-en-vivo.constants';
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
  const cine = () => buscar<HTMLElement>('app-portada-cine');
  /** Los enlaces que abren una noticia: «Leer la noticia» de la portada de cine y las tarjetas. */
  const enlaces = () => [
    ...raiz().querySelectorAll<HTMLAnchorElement>('app-portada-cine a.leer, app-tarjeta-noticia a'),
  ];

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
    expect(buscar('header.barra-superior')?.textContent).toContain('Al Día');
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado de carga mientras espera', () => {
    expect(buscar('[role="status"]')?.textContent).toContain(TEXTOS_COMUNES.cargando);
    expect(buscar('app-esqueleto-portada')).not.toBeNull();
    expect(buscar('app-tarjeta-noticia')).toBeNull();
  });

  it('mientras carga no hay portada de cine y la barra superior es sólida', () => {
    expect(cine()).toBeNull();
    expect(buscar('header.barra-superior')?.classList).not.toContain('sobre-foto');
  });

  it('la noticia del día más reciente va en la portada de cine y la siguiente, en grande', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(cine()?.querySelector('h1')?.textContent).toContain('Primera noticia');
    expect(buscar('header.barra-superior')?.classList).toContain('sobre-foto');
    const grandes = destacadas();
    expect(buscar('#titulo-destacadas')?.textContent).toContain(TEXTOS_PORTADA.destacadas);
    expect(grandes).toHaveLength(1);
    expect(grandes[0].textContent).toContain('Segunda noticia');
    expect(buscar('#titulo-region')).toBeNull();
    expect(raiz().textContent).toContain('Soacha');
    expect(buscar('[role="status"]')).toBeNull();
  });

  it('avisa cuando no hay noticias', async () => {
    respuesta.next([]);
    await fixture.whenStable();
    expect(raiz().textContent).toContain('Todavía no hay noticias publicadas.');
    expect(cine()).toBeNull();
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
    expect(cine()?.textContent).toContain('Primera noticia');
  });

  describe('vista rápida de una noticia', () => {
    const dialogo = () => buscar<HTMLDialogElement>('dialog') as HTMLDialogElement;

    beforeEach(async () => {
      simularDialogoNativo();
      respuesta.next(NOTICIAS);
      await fixture.whenStable();
    });

    it('«Leer la noticia» y las tarjetas son enlaces a la página de su noticia', () => {
      expect(enlaces().map((a) => a.getAttribute('href'))).toEqual(['/noticias/1', '/noticias/2']);
    });

    it('«Leer la noticia» de la portada de cine abre la vista rápida de esa noticia', async () => {
      enlaces()[0].click();
      await fixture.whenStable();
      expect(dialogo().hasAttribute('open')).toBe(true);
      expect(dialogo().textContent).toContain('Contenido uno');
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

  it('la búsqueda y el municipio van en la barra superior', () => {
    expect(buscar('header.barra-superior #busqueda-noticias')).not.toBeNull();
    expect(buscar('header.barra-superior #municipio-portada')).not.toBeNull();
  });

  it('«Quitar búsqueda» vuelve a pedir todas las noticias y vacía el campo', async () => {
    const entrada = buscar<HTMLInputElement>('#busqueda-noticias') as HTMLInputElement;
    entrada.value = 'feria';
    entrada.dispatchEvent(new Event('input'));
    buscar<HTMLFormElement>('form[role="search"]')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(buscar('.activa-busqueda')?.textContent).toContain('feria');

    buscar<HTMLButtonElement>('.quitar')?.click();
    await fixture.whenStable();
    expect(listar).toHaveBeenLastCalledWith({ orden: 'RECOMENDADAS', texto: undefined });
    expect(entrada.value).toBe('');
    expect(buscar('.activa-busqueda')).toBeNull();
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
    expect(buscar('.pagina')?.textContent).not.toContain('Primera noticia');
    // Las pestañas solo ordenan lo de abajo: la portada de cine no cambia.
    expect(cine()?.textContent).toContain('Primera noticia');
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

    it('respeta el orden de la API y no repite abajo ni la de la portada de cine ni las destacadas', () => {
      expect(cine()?.querySelector('h1')?.textContent).toContain('Noticia 1');
      expect(destacadas().map((t) => t.querySelector('h3')?.textContent?.trim())).toEqual(['Noticia 2', 'Noticia 3']);
      expect(compactas()[0].textContent).toContain('Noticia 4');
      expect(raiz().querySelectorAll('.pagina a[href="/noticias/1"]')).toHaveLength(0);
      expect(raiz().querySelectorAll('.pagina a[href="/noticias/2"]')).toHaveLength(1);
    });

    it('«Recientes» ordena por fecha sin pedir nada nuevo al backend', async () => {
      // Se invierte el orden de la API: la más nueva (Noticia 1) llega al final.
      respuesta.next([...MUCHAS].reverse());
      await fixture.whenStable();
      expect(destacadas()[0].textContent).toContain('Noticia 30');
      raiz().querySelectorAll<HTMLButtonElement>('.pestana')[1].click();
      await fixture.whenStable();
      // La más nueva (Noticia 1) está en la portada de cine; abajo sigue la segunda más nueva.
      expect(cine()?.querySelector('h1')?.textContent).toContain('Noticia 1');
      expect(destacadas()[0].textContent).toContain('Noticia 2');
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
      expect(buscar('#titular-portada')?.textContent).toContain('Soacha');
      expect(cine()?.querySelector('.municipio')?.textContent).toContain('Soacha');
      const datos = [...raiz().querySelectorAll('app-tarjeta-noticia .datos')];
      expect(datos.length).toBeGreaterThan(0);
      for (const dato of datos) {
        expect(dato.textContent).toContain('Soacha');
      }

      await elegirMunicipio('');
      expect(raiz().textContent).toContain('Zipaquirá');
      expect(buscar('#titular-portada')?.textContent).toContain(TEXTOS_BIENVENIDA.tuMunicipio);
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

  describe('el día en vivo', () => {
    // Tres noticias del mismo día, a las 9:00, las 12:00 y las 15:00 de Colombia.
    const DEL_DIA: Noticia[] = ['09:00', '12:00', '15:00'].map((hora, i) => ({
      id: i + 1,
      titulo: `Noticia de las ${hora}`,
      resumen: 'Resumen',
      contenido: 'Contenido',
      fechaPublicacion: `2026-09-21T${hora}:00-05:00`,
      oficial: true,
      ciudad: i === 0 ? 'Soacha' : 'Fusagasugá',
    }));

    const titular = () => cine()?.querySelector('h1')?.textContent?.trim();
    const marcas = () => [...raiz().querySelectorAll<HTMLButtonElement>('app-linea-sol button.marca')];
    const rango = () => buscar<HTMLInputElement>('app-linea-sol input[type="range"]') as HTMLInputElement;
    const etiquetaReloj = () => buscar('app-reloj-dia .etiqueta')?.textContent?.trim();
    const volver = () => buscar<HTMLButtonElement>('app-reloj-dia .volver');

    async function arrastrar(minutos: number): Promise<void> {
      rango().value = String(minutos);
      rango().dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    beforeEach(async () => {
      respuesta.next(DEL_DIA);
      await fixture.whenStable();
    });

    it('un día pasado se abre en su última noticia, con su marca activa y la fecha en el reloj', () => {
      expect(titular()).toBe('Noticia de las 15:00');
      expect(marcas()).toHaveLength(3);
      expect(marcas().map((m) => m.classList.contains('activa'))).toEqual([false, false, true]);
      expect(buscar('app-reloj-dia .hora')?.textContent).toContain('3:00');
      expect(buscar('app-reloj-dia .fecha')?.textContent).toContain('21 de septiembre');
      expect(etiquetaReloj()).toBe(TEXTOS_RELOJ.viendo);
      expect(volver()).toBeNull();
      expect(rango().max).toBe('1080');
    });

    it('al tocar una marca la portada pasa a esa noticia y la otra vuelve a la lista', async () => {
      marcas()[0].click();
      await fixture.whenStable();
      expect(titular()).toBe('Noticia de las 09:00');
      expect(marcas()[0].classList).toContain('activa');
      expect(buscar('app-reloj-dia .hora')?.textContent).toContain('9:00');
      expect(buscar('.pagina')?.textContent).toContain('Noticia de las 15:00');
      expect(buscar('.pagina')?.textContent).not.toContain('Noticia de las 09:00');
    });

    it('al arrastrar el sol sale la última noticia publicada a esa hora o antes', async () => {
      await arrastrar(13 * 60);
      expect(titular()).toBe('Noticia de las 12:00');
      expect(buscar('app-reloj-dia .hora')?.textContent).toContain('1:00');

      await arrastrar(8 * 60);
      // Antes de la primera noticia del día se muestra la primera.
      expect(titular()).toBe('Noticia de las 09:00');
    });

    it('«Volver a ahora» aparece al moverse y deja todo como estaba', async () => {
      await arrastrar(10 * 60);
      expect(volver()).not.toBeNull();

      volver()?.click();
      await fixture.whenStable();
      expect(titular()).toBe('Noticia de las 15:00');
      expect(volver()).toBeNull();
    });

    it('al soltar el deslizador se anuncia la hora y el titular', async () => {
      await arrastrar(10 * 60);
      rango().dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(buscar('app-linea-sol [aria-live]')?.textContent?.trim()).toBe(
        anuncioHora('10:00 a. m.', 'Noticia de las 09:00'),
      );
    });

    it('al cambiar de municipio el arco muestra solo sus noticias y se deja de viajar', async () => {
      await arrastrar(10 * 60);
      const selector = buscar<HTMLSelectElement>('#municipio-portada') as HTMLSelectElement;
      selector.value = 'Soacha';
      selector.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(marcas()).toHaveLength(1);
      expect(titular()).toBe('Noticia de las 09:00');
      expect(volver()).toBeNull();
      expect(buscar('app-reloj-dia .fecha')?.textContent).toContain('Soacha');
    });

    it('antes de las 5:30 p. m. el tema es de día; al llevar el sol más allá, de noche', async () => {
      const marco = () => buscar('app-marco')?.getAttribute('data-tema');
      const tinte = () => cine()?.querySelector('.tinte.visible')?.className;
      expect(marco()).toBe('dia');
      expect(tinte()).toContain('tinte-dia');

      await arrastrar(16 * 60 + 30);
      expect(marco()).toBe('dia');
      expect(tinte()).toContain('tinte-atardecer');

      await arrastrar(17 * 60 + 30);
      expect(marco()).toBe('noche');
      expect(tinte()).toContain('tinte-noche');

      await arrastrar(7 * 60);
      expect(marco()).toBe('dia');
      expect(tinte()).toContain('tinte-amanecer');
    });

    it('la vista rápida de la noticia se queda en tema de día', async () => {
      await arrastrar(17 * 60 + 45);
      expect(buscar('app-modal-noticia')?.getAttribute('data-tema')).toBe('dia');
      expect(buscar('app-marco app-modal-noticia')).toBeNull();
    });

    describe('con noticias de varios días', () => {
      const VARIOS: Noticia[] = [
        ...DEL_DIA,
        { ...DEL_DIA[0], id: 20, titulo: 'La del 19 por la mañana', fechaPublicacion: '2026-09-19T08:00:00-05:00' },
        { ...DEL_DIA[0], id: 21, titulo: 'La del 19 por la tarde', fechaPublicacion: '2026-09-19T14:30:00-05:00' },
      ];
      const fecha = () => buscar('app-reloj-dia .fecha')?.textContent;
      const cambiarDia = () => [...raiz().querySelectorAll<HTMLButtonElement>('app-reloj-dia .cambiar-dia')];

      beforeEach(async () => {
        respuesta.next(VARIOS);
        await fixture.whenStable();
      });

      it('«Día anterior» lleva al día con noticias más cercano y lo abre en su última noticia', async () => {
        expect(fecha()).toContain('21 de septiembre');
        cambiarDia()[0].click();
        await fixture.whenStable();
        expect(fecha()).toContain('19 de septiembre');
        expect(titular()).toBe('La del 19 por la tarde');
        expect(marcas()).toHaveLength(2);
        expect(buscar('app-reloj-dia .hora')?.textContent).toContain('2:30');
        // No hay noticias más viejas: «Día anterior» queda desactivado.
        expect(cambiarDia()[0].disabled).toBe(true);
        expect(cambiarDia()[1].disabled).toBe(false);
      });

      it('«Día siguiente» vuelve hacia hoy y «Volver a ahora» deshace el cambio de día', async () => {
        cambiarDia()[0].click();
        await fixture.whenStable();
        expect(volver()).not.toBeNull();

        cambiarDia()[1].click();
        await fixture.whenStable();
        expect(fecha()).toContain('21 de septiembre');

        cambiarDia()[0].click();
        await fixture.whenStable();
        volver()?.click();
        await fixture.whenStable();
        expect(fecha()).toContain('21 de septiembre');
        expect(titular()).toBe('Noticia de las 15:00');
        expect(volver()).toBeNull();
      });

      it('al cambiar de día se deja la hora que se había elegido', async () => {
        await arrastrar(10 * 60);
        cambiarDia()[0].click();
        await fixture.whenStable();
        expect(titular()).toBe('La del 19 por la tarde');
      });
    });

    it('las pestañas no cambian ni la portada de cine ni el arco', async () => {
      raiz().querySelectorAll<HTMLButtonElement>('.pestana')[3].click();
      await fixture.whenStable();
      expect(titular()).toBe('Noticia de las 15:00');
      expect(marcas()).toHaveLength(3);
    });
  });

  describe('con noticias de hoy', () => {
    const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();
    const DE_HOY: Noticia[] = [
      { ...NOTICIAS[0], id: 11, titulo: 'La más nueva', fechaPublicacion: hace(1) },
      { ...NOTICIAS[0], id: 12, titulo: 'La de antes', fechaPublicacion: hace(2) },
    ];

    it('el reloj dice «Ahora» y la portada es la última noticia publicada', async () => {
      respuesta.next(DE_HOY);
      await fixture.whenStable();
      // Cerca de la medianoche las dos pueden caer en días distintos: se revisa la más nueva.
      expect(cine()?.querySelector('h1')?.textContent).toContain('La más nueva');
      expect(buscar('app-reloj-dia .etiqueta')?.textContent?.trim()).toBe(TEXTOS_RELOJ.ahora);
      expect(buscar('app-reloj-dia .volver')).toBeNull();
    });
  });

  describe('reloj en vivo', () => {
    afterEach(() => vi.useRealTimers());

    it('la hora avanza sola y, al llegar las 5:30 p. m., la portada pasa a tema de noche', async () => {
      // Solo se simulan el reloj del sistema y el intervalo: lo demás sigue en tiempo real.
      vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
      vi.setSystemTime(new Date('2026-11-09T17:29:30-05:00'));
      const enVivo = TestBed.createComponent(Listado);
      await enVivo.whenStable();
      respuesta.next([{ ...NOTICIAS[0], id: 30, fechaPublicacion: '2026-11-09T17:00:00-05:00' }]);
      await enVivo.whenStable();
      const pagina = enVivo.nativeElement as HTMLElement;
      const tema = () => pagina.querySelector('app-marco')?.getAttribute('data-tema');
      const hora = () => pagina.querySelector('app-reloj-dia .hora')?.textContent;

      expect(pagina.querySelector('app-reloj-dia .etiqueta')?.textContent?.trim()).toBe(TEXTOS_RELOJ.ahora);
      expect(hora()).toContain('5:29');
      expect(tema()).toBe('dia');
      // El deslizador llega hasta la hora actual.
      expect(pagina.querySelector<HTMLInputElement>('app-linea-sol input')?.max).toBe(String(17 * 60 + 29));

      vi.advanceTimersByTime(INTERVALO_RELOJ_MS * 3);
      await enVivo.whenStable();
      expect(hora()).toContain('5:30');
      expect(tema()).toBe('noche');

      enVivo.destroy();
      expect(vi.getTimerCount()).toBe(0);
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
    expect(cine()?.querySelector('h1')?.textContent).toContain('Se cae el puente peatonal');
    expect(cine()?.querySelector('.urgente')?.textContent).toContain(ETIQUETAS_NOTICIA.ultimaHora);
  });
});
