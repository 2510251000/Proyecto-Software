import { Component, computed, input } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { IDIOMA } from '../../core/constants/regional.constants';
import { Noticia } from '../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../core/utils/categoria-noticia';
import { esUltimaHora, minutosDeLectura, tiempoRelativo } from '../../core/utils/noticia';
import { Miniatura } from '../miniatura/miniatura';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long' });

@Component({
  selector: 'app-tarjeta-noticia',
  imports: [Miniatura],
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
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
}
