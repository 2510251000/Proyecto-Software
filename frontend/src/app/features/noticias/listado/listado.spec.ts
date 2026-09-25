import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MENSAJES_ERROR_HTTP, TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
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
    expect(buscar('app-tarjeta-noticia')).toBeNull();
  });

  it('muestra una tarjeta por cada noticia', async () => {
    respuesta.next(NOTICIAS);
    await fixture.whenStable();
    const tarjetas = raiz().querySelectorAll('app-tarjeta-noticia');
    expect(tarjetas).toHaveLength(2);
    expect(raiz().textContent).toContain('Primera noticia');
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
    expect(raiz().querySelectorAll('app-tarjeta-noticia')).toHaveLength(2);
  });

  it('cierra la sesión y vuelve al login', () => {
    buscar<HTMLButtonElement>('header button')?.click();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login]);
  });
});
