import { DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import {
  CANTIDAD_COMUNIDAD,
  CANTIDAD_RECIENTES_LATERAL,
  CANTIDAD_SECUNDARIAS,
  NOTICIAS_POR_TANDA,
  TEXTOS_PORTADA,
} from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Noticia } from '../../../core/models/noticia.model';
import { esUltimaHora } from '../../../core/utils/noticia';
import { AuthService } from '../../../core/services/auth.service';
import { NoticiaService } from '../../../core/services/noticia.service';
import { Boton } from '../../../shared/boton/boton';
import { Encabezado } from '../../../shared/encabezado/encabezado';
import { TarjetaNoticia } from '../../../shared/tarjeta-noticia/tarjeta-noticia';
import { Apertura } from '../apertura/apertura';
import { Cintillo } from '../cintillo/cintillo';
import { EsqueletoPortada } from '../esqueleto-portada/esqueleto-portada';
import { FranjaSeccion } from '../franja-seccion/franja-seccion';
import { ConteoCiudad, Lateral } from '../lateral/lateral';
import {
  CHIPS_FIJOS,
  ChipFiltro,
  FILTRO_INICIAL,
  FiltroPortada,
  filtrarNoticias,
  mismoFiltro,
} from './filtro-portada';

/** Primera nota de la rejilla: las anteriores ya salen en la apertura. */
const INICIO_REJILLA = 1 + CANTIDAD_SECUNDARIAS;
const ID_FRANJA_CIUDAD = 'franja-ciudad';

@Component({
  selector: 'app-listado',
  imports: [
    Encabezado,
    Boton,
    TarjetaNoticia,
    Apertura,
    Cintillo,
    EsqueletoPortada,
    FranjaSeccion,
    Lateral,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado implements OnInit {
  private readonly noticiaServicio = inject(NoticiaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documento = inject(DOCUMENT);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly noticias = signal<Noticia[]>([]);
  protected readonly textos = TEXTOS_COMUNES;
  protected readonly textosPortada = TEXTOS_PORTADA;
  protected readonly idFranjaCiudad = ID_FRANJA_CIUDAD;

  // Todo lo que muestra la portada sale de la misma lista, sin peticiones nuevas.
  protected readonly filtro = signal<FiltroPortada>(FILTRO_INICIAL);
  protected readonly noticiasFiltradas = computed(() =>
    filtrarNoticias(this.noticias(), this.filtro()),
  );
  protected readonly principal = computed(() => this.noticiasFiltradas()[0] ?? null);
  protected readonly secundarias = computed(() =>
    this.noticiasFiltradas().slice(1, INICIO_REJILLA),
  );
  protected readonly visibles = signal(NOTICIAS_POR_TANDA);
  protected readonly mostradas = computed(() =>
    this.noticiasFiltradas().slice(INICIO_REJILLA, this.visibles()),
  );
  protected readonly hayMas = computed(() => this.noticiasFiltradas().length > this.visibles());
  private readonly todasComunidad = computed(() => this.noticias().filter((n) => !n.oficial));
  protected readonly comunidad = computed(() =>
    this.todasComunidad().slice(0, CANTIDAD_COMUNIDAD),
  );
  protected readonly hayMasComunidad = computed(
    () => this.todasComunidad().length > CANTIDAD_COMUNIDAD,
  );
  protected readonly ciudades = computed(() =>
    [...new Set(this.noticias().map((n) => n.ciudad))].sort((a, b) => a.localeCompare(b)),
  );
  protected readonly ultimaHora = computed(() => this.noticias().find((n) => esUltimaHora(n)) ?? null);

  protected readonly chips = computed<ChipFiltro[]>(() => [
    ...CHIPS_FIJOS,
    ...this.ciudades().map((ciudad) => ({
      etiqueta: ciudad,
      filtro: { tipo: 'ciudad', ciudad } as const,
    })),
  ]);

  /** Si hay una ciudad elegida en los chips, el lateral muestra la de esa ciudad. */
  protected readonly recientes = computed(() => {
    const filtro = this.filtro();
    const lista =
      filtro.tipo === 'ciudad' ? filtrarNoticias(this.noticias(), filtro) : this.noticias();
    return lista.slice(0, CANTIDAD_RECIENTES_LATERAL);
  });

  protected readonly conteo = computed<ConteoCiudad[]>(() =>
    this.ciudades()
      .map((ciudad) => ({
        ciudad,
        cantidad: this.noticias().filter((n) => n.ciudad === ciudad).length,
      }))
      .sort((a, b) => b.cantidad - a.cantidad || a.ciudad.localeCompare(b.ciudad)),
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noticiaServicio
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (noticias) => {
          this.noticias.set(noticias);
          this.cargando.set(false);
        },
        error: (error: ErrorApi) => {
          this.error.set(error.mensaje);
          this.cargando.set(false);
        },
      });
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate([RUTAS.login]);
  }

  protected esActivo(filtro: FiltroPortada): boolean {
    return mismoFiltro(this.filtro(), filtro);
  }

  protected filtrar(filtro: FiltroPortada): void {
    this.filtro.set(filtro);
    this.visibles.set(NOTICIAS_POR_TANDA);
  }

  protected quitarFiltro(): void {
    this.filtrar(FILTRO_INICIAL);
  }

  protected verMas(): void {
    this.visibles.update((cantidad) => cantidad + NOTICIAS_POR_TANDA);
  }

  protected verTodoCiudad(): void {
    this.visibles.set(this.noticiasFiltradas().length);
  }

  /** «Ver todo» de la comunidad: elige el chip «Comunidad» y lleva el foco a la sección. */
  protected verTodoComunidad(): void {
    this.filtrar({ tipo: 'comunidad' });
    this.documento.getElementById(ID_FRANJA_CIUDAD)?.focus();
  }
}
