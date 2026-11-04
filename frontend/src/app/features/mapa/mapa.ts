import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MAPA, TEXTOS_MAPA } from '../../core/constants/mapa.constants';
import { ETIQUETAS_TIPO } from '../../core/constants/pantallas.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { Noticia, TipoNoticias } from '../../core/models/noticia.model';
import { Coordenadas } from '../../core/models/ubicacion.model';
import { MapaDibujado, MapaService } from '../../core/services/mapa.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { Encabezado } from '../../shared/encabezado/encabezado';

const TIPOS: readonly TipoNoticias[] = ['TODAS', 'OFICIALES', 'COMUNITARIAS'];

/** Noticia con su punto en el mapa. */
interface NoticiaUbicada {
  noticia: Noticia;
  punto: Coordenadas;
}

/** true si la noticia pasa el filtro de tipo. */
export function cumpleTipo(noticia: Noticia, tipo: TipoNoticias): boolean {
  return tipo === 'TODAS' || (tipo === 'OFICIALES') === noticia.oficial;
}

/** Mapa de noticias (HU MF05_002): un marcador por noticia con ubicación, centrado en el municipio. */
@Component({
  selector: 'app-mapa',
  imports: [Encabezado, RouterLink],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements OnInit, AfterViewInit {
  private readonly mapas = inject(MapaService);
  private readonly noticiasServicio = inject(NoticiaService);
  private readonly perfiles = inject(PerfilService);
  private readonly router = inject(Router);
  private readonly contenedor = viewChild.required<ElementRef<HTMLElement>>('contenedorMapa');

  protected readonly textos = TEXTOS_MAPA;
  protected readonly tipos = TIPOS;
  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly rutas = RUTAS;

  readonly tipo = signal<TipoNoticias>('TODAS');
  private readonly noticias = signal<Noticia[] | null>(null);
  private readonly centro = signal<Coordenadas | null>(null);
  protected readonly error = signal<string | null>(null);
  private readonly mapa = signal<MapaDibujado | null>(null);

  /** Las noticias del filtro que tienen latitud y longitud. */
  readonly ubicadas = computed<NoticiaUbicada[]>(() =>
    (this.noticias() ?? [])
      .filter((n) => cumpleTipo(n, this.tipo()))
      .flatMap((noticia) =>
        noticia.latitud !== null && noticia.latitud !== undefined && noticia.longitud !== null && noticia.longitud !== undefined
          ? [{ noticia, punto: { latitud: noticia.latitud, longitud: noticia.longitud } }]
          : [],
      ),
  );
  protected readonly cargando = computed(() => this.noticias() === null && this.error() === null);

  constructor() {
    // Cada vez que cambia el filtro (o llegan las noticias) se vuelven a poner los marcadores.
    effect(() => {
      const mapa = this.mapa();
      const ubicadas = this.ubicadas();
      if (mapa === null) {
        return;
      }
      mapa.quitarMarcadores();
      for (const { noticia, punto } of ubicadas) {
        mapa.agregarMarcador(punto, noticia.oficial, this.ventanita(noticia), noticia.titulo);
      }
    });
    effect(() => {
      const centro = this.centro();
      if (centro !== null) {
        this.mapa()?.centrar(centro, MAPA.zoomCiudad);
      }
    });
    inject(DestroyRef).onDestroy(() => this.mapa()?.destruir());
  }

  ngOnInit(): void {
    forkJoin({
      perfil: this.perfiles.obtener(),
      noticias: this.noticiasServicio.listar({ orden: 'RECIENTES' }),
    }).subscribe({
      next: ({ perfil, noticias }) => {
        const ciudad = perfil.ciudad;
        if (ciudad !== null && ciudad.latitud !== null && ciudad.longitud !== null) {
          this.centro.set({ latitud: ciudad.latitud, longitud: ciudad.longitud });
        }
        this.noticias.set(noticias);
      },
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  ngAfterViewInit(): void {
    this.mapa.set(this.mapas.crear(this.contenedor().nativeElement, MAPA.centroGeneral, MAPA.zoomGeneral));
  }

  protected cambiarTipo(evento: Event): void {
    this.tipo.set((evento.target as HTMLSelectElement).value as TipoNoticias);
  }

  protected etiqueta(noticia: Noticia): string {
    return noticia.oficial ? this.textos.oficial : this.textos.comunidad;
  }

  /** Contenido de la ventanita del marcador: titular y enlace (navega sin recargar la página). */
  private ventanita(noticia: Noticia): HTMLElement {
    const caja = document.createElement('div');
    caja.className = 'ventanita-noticia';
    const titulo = document.createElement('strong');
    titulo.textContent = noticia.titulo;
    const enlace = document.createElement('a');
    const ruta = ['/', RUTAS.noticias, noticia.id];
    enlace.href = this.router.serializeUrl(this.router.createUrlTree(ruta));
    enlace.textContent = this.textos.leer;
    enlace.addEventListener('click', (evento) => {
      evento.preventDefault();
      void this.router.navigate(ruta);
    });
    caja.append(titulo, enlace);
    return caja;
  }
}
