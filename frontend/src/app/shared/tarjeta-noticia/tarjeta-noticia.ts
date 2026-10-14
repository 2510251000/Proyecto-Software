import { Component, computed, input, signal } from '@angular/core';
import { SECCION_POR_CATEGORIA } from '../../core/constants/categorias.constants';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { IDIOMA } from '../../core/constants/regional.constants';
import { Noticia } from '../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../core/utils/categoria-noticia';
import { esUltimaHora, minutosDeLectura, tiempoRelativo } from '../../core/utils/noticia';
import { Miniatura } from '../miniatura/miniatura';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long' });

/** Grados que gira la tarjeta cuando el mouse llega a un borde. */
const GIRO_MAXIMO = 5;
const SIN_GIRO = '0deg';

@Component({
  selector: 'app-tarjeta-noticia',
  imports: [Miniatura],
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
  host: {
    '[style.--giro-x]': 'giroX()',
    '[style.--giro-y]': 'giroY()',
    '(pointermove)': 'inclinar($event)',
    '(pointerleave)': 'enderezar()',
  },
})
export class TarjetaNoticia {
  readonly noticia = input.required<Noticia>();
  /** Vertical: miniatura arriba (rejillas). Horizontal: miniatura pequeña a la izquierda (apertura). */
  readonly variante = input<'vertical' | 'horizontal'>('vertical');

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  /** Fecha completa: se muestra al dejar el mouse sobre la hora relativa. */
  protected readonly fecha = computed(() => {
    const fecha = new Date(this.noticia().fechaPublicacion);
    return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
  });

  protected readonly cuando = computed(() => tiempoRelativo(this.noticia().fechaPublicacion));
  protected readonly minutosLectura = computed(() => minutosDeLectura(this.noticia().contenido));
  protected readonly ultimaHora = computed(() => esUltimaHora(this.noticia()));
  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly seccion = computed(() => SECCION_POR_CATEGORIA[this.categoria()]);

  // Inclinación 3D: el CSS solo usa estos giros con mouse y si no se pidió menos movimiento.
  protected readonly giroX = signal(SIN_GIRO);
  protected readonly giroY = signal(SIN_GIRO);

  /** Gira la tarjeta hacia donde está el mouse: en el centro queda plana y en los bordes llega al máximo. */
  protected inclinar(evento: PointerEvent): void {
    if (this.variante() !== 'vertical' || evento.pointerType === 'touch') {
      return;
    }
    const caja = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    if (caja.width === 0 || caja.height === 0) {
      return;
    }
    const horizontal = ((evento.clientX - caja.left) / caja.width) * 2 - 1;
    const vertical = ((evento.clientY - caja.top) / caja.height) * 2 - 1;
    this.giroX.set(`${(-vertical * GIRO_MAXIMO).toFixed(2)}deg`);
    this.giroY.set(`${(horizontal * GIRO_MAXIMO).toFixed(2)}deg`);
  }

  protected enderezar(): void {
    this.giroX.set(SIN_GIRO);
    this.giroY.set(SIN_GIRO);
  }
}
