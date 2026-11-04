import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { TIEMPOS_HOY } from '../../core/constants/animaciones.constants';
import { TEXTOS_HOY } from '../../core/constants/hoy.constants';
import { NOMBRE_PORTAL } from '../../core/constants/marca.constants';
import { IDIOMA } from '../../core/constants/regional.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { Noticia } from '../../core/models/noticia.model';
import { Perfil } from '../../core/models/perfil.model';
import { MovimientoService } from '../../core/services/movimiento.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { Temporizadores } from '../../core/utils/temporizadores';
import { Historias } from './historias/historias';
import { cercaDeTi, saludoCompleto, seleccionarHistorias } from './seleccion-historias';

/** Momento de la pantalla. */
export type FaseHoy = 'cargando' | 'intro' | 'historias' | 'final' | 'error';

interface DatosHoy {
  perfil: Perfil;
  delMunicipio: Noticia[];
  todas: Noticia[];
}

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * «Hoy»: las noticias del municipio del usuario como historias (tipo Instagram o TikTok).
 * Saludo → historias → tarjeta final con «Cerca de ti».
 */
@Component({
  selector: 'app-hoy',
  imports: [RouterLink, Historias],
  templateUrl: './hoy.html',
  styleUrl: './hoy.css',
})
export class Hoy implements OnInit {
  private readonly perfiles = inject(PerfilService);
  private readonly noticias = inject(NoticiaService);
  private readonly router = inject(Router);
  private readonly movimiento = inject(MovimientoService);
  private readonly temporizadores = new Temporizadores(inject(DestroyRef));

  protected readonly textos = TEXTOS_HOY;
  protected readonly rutas = RUTAS;
  protected readonly reducirMovimiento = this.movimiento.reducirMovimiento();

  readonly fase = signal<FaseHoy>('cargando');
  protected readonly error = signal<string | null>(null);
  private readonly datos = signal<DatosHoy | null>(null);
  private readonly ahora = new Date();

  protected readonly fecha = FORMATO_FECHA.format(this.ahora);
  protected readonly ciudadId = computed(() => this.datos()?.perfil.ciudad?.id ?? null);
  /** Nombre del municipio; sin ciudad en el perfil se muestran las de todo el portal. */
  protected readonly municipio = computed(() => this.datos()?.perfil.ciudad?.nombre ?? NOMBRE_PORTAL);
  protected readonly saludo = computed(() => saludoCompleto(this.ahora, this.datos()?.perfil.nombre ?? null));
  protected readonly letras = computed(() => [...this.municipio()].map((letra) => (letra === ' ' ? ' ' : letra)));

  readonly seleccion = computed(() => seleccionarHistorias(this.datos()?.delMunicipio ?? [], this.ahora));
  readonly cercanas = computed(() =>
    cercaDeTi(this.datos()?.todas ?? [], this.ciudadId(), this.seleccion().historias),
  );

  protected readonly subtitulo = computed(() => {
    const { historias, sonDeHoy } = this.seleccion();
    if (historias.length === 0) {
      return TEXTOS_HOY.subtituloVacio;
    }
    return sonDeHoy ? TEXTOS_HOY.subtituloHoy : TEXTOS_HOY.subtituloRespaldo;
  });

  protected readonly tituloFinal = computed(() =>
    this.ciudadId() === null
      ? TEXTOS_HOY.yaEstasAlDia
      : `${TEXTOS_HOY.yaEstasAlDia} ${TEXTOS_HOY.en} ${this.municipio()}`,
  );

  ngOnInit(): void {
    this.cargar().subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.fase.set('intro');
        if (!this.reducirMovimiento) {
          this.temporizadores.programar(() => this.empezar(), TIEMPOS_HOY.intro);
        }
      },
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.fase.set('error');
      },
    });
  }

  /** Termina la intro (sola, o con el botón «Ver las noticias»). */
  empezar(): void {
    if (this.fase() !== 'intro') {
      return;
    }
    this.temporizadores.cancelarTodos();
    this.fase.set(this.seleccion().historias.length > 0 ? 'historias' : 'final');
  }

  terminarHistorias(): void {
    this.fase.set('final');
  }

  /** El visor se crea de nuevo, así que arranca otra vez en la primera historia. */
  protected verOtraVez(): void {
    if (this.seleccion().historias.length > 0) {
      this.fase.set('historias');
    }
  }

  protected irAPortada(): void {
    void this.router.navigate([RUTAS.noticias]);
  }

  protected retrasoLetra(posicion: number): number {
    return TIEMPOS_HOY.inicioLetras + posicion * TIEMPOS_HOY.pasoLetra;
  }

  protected retrasoCercana(posicion: number): number {
    return posicion * TIEMPOS_HOY.pasoCercaDeTi;
  }

  /** Perfil y noticias. Con ciudad: las de su municipio y las de todo el portal (para «Cerca de ti»). */
  private cargar(): Observable<DatosHoy> {
    return this.perfiles.obtener().pipe(
      switchMap((perfil) => {
        const todas$ = this.noticias.listar({ orden: 'RECIENTES' });
        if (!perfil.ciudad) {
          return todas$.pipe(map((todas) => ({ perfil, delMunicipio: todas, todas })));
        }
        return forkJoin({
          delMunicipio: this.noticias.listar({ ciudadId: perfil.ciudad.id, orden: 'RECIENTES' }),
          todas: todas$,
        }).pipe(map(({ delMunicipio, todas }) => ({ perfil, delMunicipio, todas })));
      }),
    );
  }
}
