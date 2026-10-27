import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MENSAJES_ERROR_HTTP, TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { TEXTOS_NOTICIA } from '../../../core/constants/portada.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Noticia } from '../../../core/models/noticia.model';
import { AuthService } from '../../../core/services/auth.service';
import { NoticiaService } from '../../../core/services/noticia.service';
import { campanaFalsa } from '../../../../testing/menu-falso';
import { AlmacenNoticias } from '../almacen-noticias';
import { Detalle } from './detalle';

const NOTICIAS: Noticia[] = [
  {
    id: 1,
    titulo: 'Primera noticia',
    resumen: 'Resumen uno',
    contenido: 'Párrafo uno.\n\nPárrafo dos.',
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

describe('Detalle', () => {
  let fixture: ComponentFixture<Detalle>;
  let respuesta: Subject<Noticia[]>;
  let listar: ReturnType<typeof vi.fn>;
  let obtener: ReturnType<typeof vi.fn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);

  /** Abre la página de la noticia con ese id en la URL. */
  async function abrir(id: string, antes: () => void = () => undefined): Promise<void> {
    respuesta = new Subject<Noticia[]>();
    listar = vi.fn(() => respuesta);
    obtener = vi.fn(() => throwError(() => ({ estado: 404, mensaje: 'La noticia no existe' })));
    await TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        provideRouter([]),
        { provide: NoticiaService, useValue: { listar, obtener } },
        { provide: AuthService, useValue: { obtenerContenidoToken: () => null, cerrarSesion: () => undefined } },
        campanaFalsa(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
      ],
    }).compileComponents();
    antes();
    fixture = TestBed.createComponent(Detalle);
    await fixture.whenStable();
  }

  it('si se entra directo a la URL, pide el listado y muestra la carga', async () => {
    await abrir('2');
    expect(listar).toHaveBeenCalledTimes(1);
    expect(buscar('[role="status"]')?.textContent).toContain(TEXTOS_COMUNES.cargando);
  });

  it('cuando llega el listado muestra la noticia de la URL con su titular como h1', async () => {
    await abrir('2');
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(buscar('h1')?.textContent).toContain('Segunda noticia');
    expect(raiz().textContent).toContain('Resumen dos');
    expect(raiz().textContent).not.toContain('Primera noticia');
    expect(buscar('[role="status"]')).toBeNull();
  });

  it('si el listado ya estaba en memoria no lo vuelve a pedir', async () => {
    await abrir('1', () => {
      TestBed.inject(AlmacenNoticias).cargar();
      respuesta.next(NOTICIAS);
    });
    expect(listar).toHaveBeenCalledTimes(1);
    expect(buscar('h1')?.textContent).toContain('Primera noticia');
  });

  it('separa el contenido en párrafos y lo trata como texto, no como HTML', async () => {
    await abrir('1');
    respuesta.next([{ ...NOTICIAS[0], contenido: 'Uno.\n\n<b>Dos</b>' }]);
    await fixture.whenStable();
    const parrafos = [...raiz().querySelectorAll('.parrafo')].map((p) => p.textContent);
    expect(parrafos).toEqual(['Uno.', '<b>Dos</b>']);
    expect(buscar('.parrafo b')).toBeNull();
  });

  it.each(['99', 'abc'])('con el id «%s» dice que no la encontró y ofrece volver', async (id) => {
    await abrir(id);
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(buscar('h1')?.textContent).toContain(TEXTOS_NOTICIA.noEncontrada);
    expect(buscar('main a')?.getAttribute('href')).toBe('/noticias');
  });

  it('si el listado falla muestra el error y permite reintentar', async () => {
    await abrir('1');
    const error: ErrorApi = { estado: 500, mensaje: MENSAJES_ERROR_HTTP.generico };
    respuesta.error(error);
    await fixture.whenStable();
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_ERROR_HTTP.generico);

    respuesta = new Subject<Noticia[]>();
    buscar<HTMLButtonElement>('[role="alert"] button')?.click();
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    expect(listar).toHaveBeenCalledTimes(2);
    expect(buscar('h1')?.textContent).toContain('Primera noticia');
  });
});
