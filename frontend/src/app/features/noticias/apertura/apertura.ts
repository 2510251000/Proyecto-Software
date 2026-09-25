import { Component, computed, input } from '@angular/core';
import { SECCION_POR_CATEGORIA } from '../../../core/constants/categorias.constants';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../../core/utils/categoria-noticia';
import { minutosDeLectura, tiempoRelativo } from '../../../core/utils/noticia';
import { Miniatura } from '../../../shared/miniatura/miniatura';
import { TarjetaNoticia } from '../../../shared/tarjeta-noticia/tarjeta-noticia';

/** Apertura de la portada: la noticia más reciente en grande y las siguientes al lado. */
@Component({
  selector: 'app-apertura',
  imports: [Miniatura, TarjetaNoticia],
  templateUrl: './apertura.html',
  styleUrl: './apertura.css',
})
export class Apertura {
  readonly principal = input.required<Noticia>();
  readonly secundarias = input<readonly Noticia[]>([]);

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  protected readonly categoria = computed(() => categoriaDeNoticia(this.principal().titulo));
  protected readonly seccion = computed(() => SECCION_POR_CATEGORIA[this.categoria()]);
  protected readonly cuando = computed(() => tiempoRelativo(this.principal().fechaPublicacion));
  protected readonly minutosLectura = computed(() => minutosDeLectura(this.principal().contenido));
}
