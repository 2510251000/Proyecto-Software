import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TIEMPOS_HOY } from '../../../core/constants/animaciones.constants';
import { PORCENTAJE_ZONA_ANTERIOR, TEXTOS_HOY } from '../../../core/constants/hoy.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { categoriaDeNoticia } from '../../../core/utils/categoria-noticia';
import { tiempoRelativo } from '../../../core/utils/noticia';
import { Temporizadores } from '../../../core/utils/temporizadores';
import { Miniatura } from '../../../shared/miniatura/miniatura';
import { ListaHistorias } from '../lista-historias/lista-historias';
import { iniciales } from '../seleccion-historias';
import { TextoHistoria } from '../texto-historia/texto-historia';

/** Elementos donde la barra espaciadora ya tiene su propio uso (activar, escribir). */
const ELEMENTOS_INTERACTIVOS = new Set(['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Visor de noticias tipo historias: una a la vez, con barra de progreso, avance solo cada
 * TIEMPOS_HOY.historia ms, toques a los lados, flechas del teclado y pausa.
 * Con «reducir movimiento» no avanza solo.
 */
@Component({
  selector: 'app-historias',
  imports: [Miniatura, ListaHistorias, TextoHistoria],
  templateUrl: './historias.html',
  styleUrl: './historias.css',
  host: {
    '[style.--duracion-historia.ms]': 'tiempos.historia',
    '(document:keydown)': 'teclaPresionada($event)',
  },
})
export class Historias implements OnInit {
  private readonly router = inject(Router);
  private readonly movimiento = inject(MovimientoService);
  private readonly temporizadores = new Temporizadores(inject(DestroyRef));

  readonly historias = input.required<Noticia[]>();
  readonly municipio = input.required<string>();
  readonly fecha = input.required<string>();
  /** Se pasó de la última historia. */
  readonly terminar = output<void>();

  protected readonly textos = TEXTOS_HOY;
  protected readonly tiempos = TIEMPOS_HOY;
  protected readonly zonaAnterior = PORCENTAJE_ZONA_ANTERIOR;
  protected readonly reducirMovimiento = this.movimiento.reducirMovimiento();

  readonly indice = signal(0);
  readonly pausado = signal(false);
  /** Cambia en cada salto, para que la historia y su barra arranquen la animación de cero. */
  protected readonly vuelta = signal(0);

  protected readonly actual = computed(() => this.historias()[this.indice()]);
  protected readonly siguiente = computed(() => this.historias()[this.indice() + 1] ?? null);
  protected readonly autor = computed(() => this.actual().autor?.trim() || TEXTOS_HOY.autorDesconocido);
  protected readonly inicialesAutor = computed(() => iniciales(this.autor()));
  protected readonly cuando = computed(() => tiempoRelativo(this.actual().fechaPublicacion));
  protected readonly categoria = computed(() => categoriaDeNoticia(this.actual().titulo));
  protected readonly anuncio = computed(
    () =>
      `${TEXTOS_HOY.historia} ${this.indice() + 1} ${TEXTOS_HOY.de} ${this.historias().length}: ${this.actual().titulo}`,
  );

  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private inicioConteo = 0;
  private restante: number = TIEMPOS_HOY.historia;
  private presion: ReturnType<typeof setTimeout> | null = null;
  private fuePresionLarga = false;

  ngOnInit(): void {
    this.contar(TIEMPOS_HOY.historia);
  }

  irA(posicion: number): void {
    if (posicion >= this.historias().length) {
      this.detenerConteo();
      this.terminar.emit();
      return;
    }
    this.indice.set(Math.max(0, posicion));
    this.vuelta.update((v) => v + 1);
    this.pausado.set(false);
    this.contar(TIEMPOS_HOY.historia);
  }

  anterior(): void {
    this.irA(this.indice() - 1);
  }

  avanzar(): void {
    this.irA(this.indice() + 1);
  }

  alternarPausa(): void {
    if (this.pausado()) {
      this.reanudar();
    } else {
      this.pausar();
    }
  }

  pausar(): void {
    if (this.pausado()) {
      return;
    }
    this.pausado.set(true);
    if (this.temporizador !== null) {
      this.restante = Math.max(0, this.restante - (Date.now() - this.inicioConteo));
      this.detenerConteo();
    }
  }

  reanudar(): void {
    if (!this.pausado()) {
      return;
    }
    this.pausado.set(false);
    this.contar(this.restante);
  }

  protected cerrar(): void {
    void this.router.navigate([RUTAS.noticias]);
  }

  /** Toque en la zona izquierda o derecha. Si venía de mantener presionado, solo reanuda. */
  protected tocar(zona: 'anterior' | 'siguiente'): void {
    if (this.fuePresionLarga) {
      this.fuePresionLarga = false;
      return;
    }
    if (zona === 'anterior') {
      this.anterior();
    } else {
      this.avanzar();
    }
  }

  protected presionar(): void {
    this.fuePresionLarga = false;
    this.temporizadores.cancelar(this.presion);
    this.presion = this.temporizadores.programar(() => {
      this.presion = null;
      this.fuePresionLarga = true;
      this.pausar();
    }, TIEMPOS_HOY.presionLarga);
  }

  protected soltar(): void {
    this.temporizadores.cancelar(this.presion);
    this.presion = null;
    if (this.fuePresionLarga) {
      this.reanudar();
    }
  }

  protected teclaPresionada(evento: KeyboardEvent): void {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      this.anterior();
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      this.avanzar();
    } else if (evento.key === ' ' && !this.esInteractivo(evento.target)) {
      evento.preventDefault();
      this.alternarPausa();
    }
  }

  protected nivelAutor(): number | null {
    return this.actual().autorNivel ?? null;
  }

  private esInteractivo(objetivo: EventTarget | null): boolean {
    return objetivo instanceof HTMLElement && ELEMENTOS_INTERACTIVOS.has(objetivo.tagName);
  }

  private contar(ms: number): void {
    this.detenerConteo();
    this.restante = ms;
    if (this.reducirMovimiento || this.pausado()) {
      return;
    }
    this.inicioConteo = Date.now();
    this.temporizador = this.temporizadores.programar(() => {
      this.temporizador = null;
      this.avanzar();
    }, ms);
  }

  private detenerConteo(): void {
    this.temporizadores.cancelar(this.temporizador);
    this.temporizador = null;
  }
}
