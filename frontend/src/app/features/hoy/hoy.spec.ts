import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TIEMPOS_HOY } from '../../core/constants/animaciones.constants';
import { SALUDOS, TEXTOS_HOY } from '../../core/constants/hoy.constants';
import { NOMBRE_PORTAL } from '../../core/constants/marca.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { CriteriosNoticias, Noticia } from '../../core/models/noticia.model';
import { Perfil } from '../../core/models/perfil.model';
import { MovimientoService } from '../../core/services/movimiento.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { noticiaFalsa } from '../../../testing/noticia-falsa';
import { Hoy } from './hoy';

/** Miércoles 4 de noviembre de 2026, 8:00 a. m. hora local. */
const AHORA = new Date(2026, 10, 4, 8, 0, 0);
const HOY_TEMPRANO = new Date(2026, 10, 4, 7, 0, 0).toISOString();
const AYER = new Date(2026, 10, 3, 18, 0, 0).toISOString();

function perfilFalso(cambios: Partial<Perfil> = {}): Perfil {
  return {
    id: 7,
    correo: 'vecina@aldia.com',
    nombre: 'Laura Méndez',
    rol: ROLES.usuarioComun,
    nivel: 'Activo',
    nivelNumero: 2,
    puntaje: 60,
    siguienteNivel: null,
    ciudad: { id: 1, nombre: 'Fusagasugá', departamento: 'Cundinamarca', latitud: null, longitud: null },
    cupo: { limite: 10, publicadasHoy: 0, restantes: 10, ilimitado: false },
    fechaRegistro: '2026-10-01T10:00:00',
    ...cambios,
  };
}

describe('Hoy', () => {
  let fixture: ComponentFixture<Hoy>;
  let componente: Hoy;
  let listar: ReturnType<typeof vi.fn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);

  interface Opciones {
    perfil?: Perfil;
    delMunicipio?: Noticia[];
    todas?: Noticia[];
    reducirMovimiento?: boolean;
    perfil$?: Observable<Perfil>;
  }

  async function crear(opciones: Opciones = {}): Promise<void> {
    const {
      perfil = perfilFalso(),
      delMunicipio = [noticiaFalsa({ id: 1, fechaPublicacion: HOY_TEMPRANO })],
      todas = [
        ...delMunicipio,
        noticiaFalsa({ id: 20, ciudadId: 2, ciudad: 'Zipaquirá', titulo: 'Noticia de Zipaquirá' }),
      ],
      reducirMovimiento = false,
      perfil$ = of(perfil),
    } = opciones;
    listar = vi.fn((criterios: CriteriosNoticias) => of(criterios.ciudadId === undefined ? todas : delMunicipio));
    await TestBed.configureTestingModule({
      imports: [Hoy],
      providers: [
        provideRouter([]),
        { provide: PerfilService, useValue: { obtener: () => perfil$ } },
        { provide: NoticiaService, useValue: { listar } },
        { provide: MovimientoService, useValue: { reducirMovimiento: () => reducirMovimiento } },
      ],
    }).compileComponents();
    vi.useFakeTimers();
    vi.setSystemTime(AHORA);
    fixture = TestBed.createComponent(Hoy);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function pasar(ms: number): void {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  afterEach(() => vi.useRealTimers());

  it('pide las noticias del municipio del usuario y las de todo el portal, por recientes', async () => {
    await crear();
    expect(listar).toHaveBeenCalledWith({ ciudadId: 1, orden: 'RECIENTES' });
    expect(listar).toHaveBeenCalledWith({ orden: 'RECIENTES' });
  });

  it('la intro saluda según la hora y muestra el municipio letra por letra', async () => {
    await crear();
    expect(componente.fase()).toBe('intro');
    expect(buscar('.saludo')?.textContent).toBe(`${SALUDOS.manana}, Laura`);
    const municipio = buscar('.municipio-grande');
    expect(municipio?.getAttribute('aria-label')).toBe('Fusagasugá');
    expect(municipio?.querySelectorAll('.letra')).toHaveLength('Fusagasugá'.length);
    expect(buscar('.subtitulo')?.textContent).toBe(TEXTOS_HOY.subtituloHoy);
  });

  it('después de la intro empiezan las historias', async () => {
    await crear();
    pasar(TIEMPOS_HOY.intro);
    expect(componente.fase()).toBe('historias');
    expect(buscar('app-historias')).not.toBeNull();
  });

  it('«Ver las noticias» salta la intro', async () => {
    await crear();
    buscar<HTMLButtonElement>('.empezar')?.click();
    fixture.detectChanges();
    expect(componente.fase()).toBe('historias');
    componente.empezar();
    expect(componente.fase()).toBe('historias');
  });

  it('si hoy no hay noticias, usa las más recientes y lo dice', async () => {
    await crear({ delMunicipio: [noticiaFalsa({ id: 1, fechaPublicacion: AYER })] });
    expect(buscar('.subtitulo')?.textContent).toBe(TEXTOS_HOY.subtituloRespaldo);
    expect(componente.seleccion().sonDeHoy).toBe(false);
    expect(componente.seleccion().historias).toHaveLength(1);
  });

  it('sin ciudad usa las más recientes de todo el portal', async () => {
    const todas = [noticiaFalsa({ id: 1, fechaPublicacion: HOY_TEMPRANO }), noticiaFalsa({ id: 2, fechaPublicacion: AYER })];
    await crear({ perfil: perfilFalso({ ciudad: null, nombre: null }), todas });
    expect(listar).toHaveBeenCalledTimes(1);
    expect(listar).toHaveBeenCalledWith({ orden: 'RECIENTES' });
    expect(buscar('.saludo')?.textContent).toBe(SALUDOS.manana);
    expect(buscar('.municipio-grande')?.getAttribute('aria-label')).toBe(NOMBRE_PORTAL);
    componente.empezar();
    componente.terminarHistorias();
    fixture.detectChanges();
    expect(buscar('.titulo-final')?.textContent).toBe(TEXTOS_HOY.yaEstasAlDia);
    expect(componente.cercanas().map((n) => n.id)).toEqual([2]);
  });

  it('con «reducir movimiento» la intro no avanza sola', async () => {
    await crear({ reducirMovimiento: true });
    expect(buscar('.intro')?.classList).toContain('sin-movimiento');
    pasar(TIEMPOS_HOY.intro * 3);
    expect(componente.fase()).toBe('intro');
  });

  it('al terminar muestra «Ya estás al día», «Cerca de ti» y deja ver otra vez', async () => {
    await crear();
    componente.empezar();
    componente.terminarHistorias();
    fixture.detectChanges();
    expect(buscar('.titulo-final')?.textContent).toBe(`${TEXTOS_HOY.yaEstasAlDia} ${TEXTOS_HOY.en} Fusagasugá`);
    expect(buscar('.cerca-titulo')?.textContent).toBe(TEXTOS_HOY.cercaDeTi);
    const cercanas = raiz().querySelectorAll('.cercana');
    expect(cercanas).toHaveLength(1);
    expect(cercanas[0].textContent).toContain('Zipaquirá');
    buscar<HTMLButtonElement>('.boton-marca')?.click();
    fixture.detectChanges();
    expect(componente.fase()).toBe('historias');
  });

  it('«Ir a la portada» lleva al listado', async () => {
    await crear();
    componente.empezar();
    componente.terminarHistorias();
    fixture.detectChanges();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    buscar<HTMLButtonElement>('.boton-borde')?.click();
    expect(navegar).toHaveBeenCalledWith([RUTAS.noticias]);
  });

  it('sin ninguna noticia pasa directo al final, sin «Ver otra vez»', async () => {
    await crear({ delMunicipio: [], todas: [] });
    expect(buscar('.subtitulo')?.textContent).toBe(TEXTOS_HOY.subtituloVacio);
    pasar(TIEMPOS_HOY.intro);
    expect(componente.fase()).toBe('final');
    expect(buscar('.boton-marca')).toBeNull();
    expect(buscar('.cercanas')).toBeNull();
  });

  it('si la API falla, muestra el error y el camino a la portada', async () => {
    await crear({ perfil$: throwError(() => ({ estado: 500, mensaje: 'Algo salió mal' })) });
    expect(componente.fase()).toBe('error');
    expect(buscar('[role="alert"]')?.textContent).toContain('Algo salió mal');
  });
});
