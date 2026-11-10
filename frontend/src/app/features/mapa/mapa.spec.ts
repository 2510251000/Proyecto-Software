import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MAPA, TEXTOS_MAPA } from '../../core/constants/mapa.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { Perfil } from '../../core/models/perfil.model';
import { Coordenadas } from '../../core/models/ubicacion.model';
import { AuthService } from '../../core/services/auth.service';
import { MapaDibujado, MapaService } from '../../core/services/mapa.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { noticiaFalsa } from '../../../testing/noticia-falsa';
import { cumpleTipo, Mapa } from './mapa';

/** Mapa falso: guarda lo que el componente le pide, sin Leaflet ni red. */
class MapaFalso implements MapaDibujado {
  marcadores: { punto: Coordenadas; oficial: boolean; contenido: HTMLElement; titulo: string }[] = [];
  centro: Coordenadas | null = null;
  zoom = 0;
  destruido = false;

  agregarMarcador(punto: Coordenadas, oficial: boolean, contenido: HTMLElement, titulo: string): void {
    this.marcadores.push({ punto, oficial, contenido, titulo });
  }

  quitarMarcadores(): void {
    this.marcadores = [];
  }

  centrar(punto: Coordenadas, zoom: number): void {
    this.centro = punto;
    this.zoom = zoom;
  }

  destruir(): void {
    this.destruido = true;
  }
}

const NOTICIAS = [
  noticiaFalsa({ id: 1, titulo: 'Oficial con punto', oficial: true, latitud: 4.33, longitud: -74.36 }),
  noticiaFalsa({ id: 2, titulo: 'Comunidad con punto', oficial: false, latitud: 4.34, longitud: -74.37 }),
  noticiaFalsa({ id: 3, titulo: 'Sin punto', oficial: false, latitud: null, longitud: null }),
];

function perfil(conCiudad: boolean): Perfil {
  return {
    id: 7,
    correo: 'vecina@aldia.com',
    nombre: 'Laura',
    rol: ROLES.usuarioComun,
    nivel: 'Básico',
    nivelNumero: 1,
    puntaje: 0,
    siguienteNivel: null,
    ciudad: conCiudad
      ? { id: 1, nombre: 'Fusagasugá', departamento: 'Cundinamarca', latitud: 4.3372, longitud: -74.3639 }
      : null,
    cupo: { limite: 3, publicadasHoy: 0, restantes: 3, ilimitado: false },
    fechaRegistro: '2026-10-01T10:00:00',
  };
}

describe('Mapa', () => {
  let mapa: MapaFalso;
  let crear: ReturnType<typeof vi.fn>;

  async function montar(conCiudad = true, falla = false) {
    mapa = new MapaFalso();
    crear = vi.fn(() => mapa);
    await TestBed.configureTestingModule({
      imports: [Mapa],
      providers: [
        provideRouter([]),
        campanaFalsa(),
        { provide: AuthService, useValue: { obtenerContenidoToken: () => null, cerrarSesion: () => undefined } },
        { provide: MapaService, useValue: { crear } },
        { provide: PerfilService, useValue: { obtener: () => of(perfil(conCiudad)) } },
        {
          provide: NoticiaService,
          useValue: { listar: () => (falla ? throwError(() => ({ estado: 0, mensaje: 'Sin conexión' })) : of(NOTICIAS)) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Mapa);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  it('crea el mapa y lo centra en la ciudad del usuario', async () => {
    await montar();
    expect(crear).toHaveBeenCalledWith(expect.any(HTMLElement), MAPA.centroGeneral, MAPA.zoomGeneral);
    expect(mapa.centro).toEqual({ latitud: 4.3372, longitud: -74.3639 });
    expect(mapa.zoom).toBe(MAPA.zoomCiudad);
  });

  it('sin ciudad deja la vista general', async () => {
    await montar(false);
    expect(mapa.centro).toBeNull();
  });

  it('pone un marcador por noticia con ubicación, distinto para oficial y comunidad', async () => {
    await montar();
    expect(mapa.marcadores.map((m) => [m.titulo, m.oficial])).toEqual([
      ['Oficial con punto', true],
      ['Comunidad con punto', false],
    ]);
  });

  it('la ventanita trae el titular y un enlace que navega a la noticia', async () => {
    await montar();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const ventanita = mapa.marcadores[0].contenido;
    expect(ventanita.querySelector('strong')?.textContent).toBe('Oficial con punto');
    const enlace = ventanita.querySelector('a') as HTMLAnchorElement;
    expect(enlace.getAttribute('href')).toBe('/noticias/1');
    expect(enlace.textContent).toBe(TEXTOS_MAPA.leer);
    enlace.click();
    expect(navegar).toHaveBeenCalledWith(['/', 'noticias', 1]);
  });

  it('el filtro por tipo cambia los marcadores y la lista en texto', async () => {
    const { fixture, raiz } = await montar();
    const selector = raiz.querySelector('select') as HTMLSelectElement;
    selector.value = 'COMUNITARIAS';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(mapa.marcadores.map((m) => m.titulo)).toEqual(['Comunidad con punto']);
    const lista = [...raiz.querySelectorAll('.noticia a')].map((a) => a.textContent);
    expect(lista).toEqual(['Comunidad con punto']);
  });

  it('la lista en texto muestra las mismas noticias del mapa', async () => {
    const { raiz } = await montar();
    expect(raiz.querySelectorAll('.noticia')).toHaveLength(2);
    expect(raiz.querySelector('.tipo.oficial')?.textContent).toContain(TEXTOS_MAPA.oficial);
    expect(raiz.querySelector('.mapa')?.getAttribute('aria-label')).toBe(TEXTOS_MAPA.mapa);
  });

  it('si la API falla muestra el error', async () => {
    const { raiz } = await montar(true, true);
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Sin conexión');
  });

  it('al salir de la pantalla destruye el mapa', async () => {
    const { fixture } = await montar();
    fixture.destroy();
    expect(mapa.destruido).toBe(true);
  });

  it('cumpleTipo filtra oficiales y comunitarias', () => {
    expect(cumpleTipo(NOTICIAS[0], 'TODAS')).toBe(true);
    expect(cumpleTipo(NOTICIAS[0], 'OFICIALES')).toBe(true);
    expect(cumpleTipo(NOTICIAS[0], 'COMUNITARIAS')).toBe(false);
    expect(cumpleTipo(NOTICIAS[1], 'COMUNITARIAS')).toBe(true);
  });
});

describe('MapaService', () => {
  it('dibuja con Leaflet, pone y quita marcadores y se destruye', () => {
    const elemento = document.createElement('div');
    document.body.append(elemento);
    const servicio = TestBed.inject(MapaService);
    const dibujado = servicio.crear(elemento, MAPA.centroGeneral, MAPA.zoomGeneral);
    dibujado.agregarMarcador({ latitud: 4.3, longitud: -74.3 }, true, document.createElement('div'), 'Oficial');
    dibujado.agregarMarcador({ latitud: 4.4, longitud: -74.4 }, false, document.createElement('div'), 'Comunidad');
    expect(elemento.querySelectorAll('.marcador-noticia')).toHaveLength(2);
    expect(elemento.querySelector('.marcador-oficial')?.getAttribute('title')).toBe('Oficial');
    expect(elemento.querySelector('.leaflet-control-attribution')?.textContent).toContain('OpenStreetMap');
    dibujado.centrar({ latitud: 4.3, longitud: -74.3 }, MAPA.zoomCiudad);
    dibujado.quitarMarcadores();
    expect(elemento.querySelectorAll('.marcador-noticia')).toHaveLength(0);
    dibujado.destruir();
    elemento.remove();
  });
});
