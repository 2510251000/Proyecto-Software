import { Component, computed, input, output } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../../core/utils/categoria-noticia';
import { diaDe, horaDecimal, horaLegible } from '../../../core/utils/dia-en-vivo';
import { portadaDe } from '../../../core/utils/imagenes';
import { etiquetaOrigen, minutosDeLectura, nombreAutor, tiempoRelativo } from '../../../core/utils/noticia';
import { EnlaceNoticia } from '../../../shared/enlace-noticia/enlace-noticia';
import { Miniatura } from '../../../shared/miniatura/miniatura';

/**
 * Formas de una ficha del mosaico:
 * - `foto-grande`: la foto llena la ficha y el texto va encima, en blanco.
 * - `color`: fondo ámbar y todo en azul, sin foto.
 * - `con-foto`: foto arriba y el texto debajo.
 * - `horizontal`: foto a la izquierda; es la de «Días anteriores».
 */
export type VarianteFicha = 'foto-grande' | 'color' | 'con-foto' | 'horizontal';

/**
 * Una noticia en el mosaico de la portada. Toda la ficha es un enlace a la noticia y, con
 * un clic normal, abre la vista rápida (appEnlaceNoticia).
 */
@Component({
  selector: 'app-ficha-noticia',
  imports: [EnlaceNoticia, Miniatura],
  templateUrl: './ficha-noticia.html',
  styleUrl: './ficha-noticia.css',
})
export class FichaNoticia {
  readonly noticia = input.required<Noticia>();
  readonly variante = input<VarianteFicha>('con-foto');
  /** El día que muestra la portada («2026-11-09»): las noticias de ese día llevan su hora. */
  readonly dia = input('');
  /** Clic normal en la ficha: quien la usa decide cómo mostrar la noticia. */
  readonly abrir = output<Noticia>();

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly foto = computed(() => portadaDe(this.noticia()));
  protected readonly etiqueta = computed(() => etiquetaOrigen(this.noticia()));
  protected readonly autor = computed(() => nombreAutor(this.noticia()));
  protected readonly minutos = computed(() => minutosDeLectura(this.noticia().contenido));

  /** «10:30 a. m.» si la noticia es del día mostrado; si no, «ayer», «hace 3 días»… */
  protected readonly cuando = computed(() => {
    const fecha = this.noticia().fechaPublicacion;
    const hora = horaDecimal(fecha);
    return hora !== null && diaDe(fecha) === this.dia() ? horaLegible(hora) : tiempoRelativo(fecha);
  });
}
