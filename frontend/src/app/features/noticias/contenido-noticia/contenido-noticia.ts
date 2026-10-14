import { Component, computed, input } from '@angular/core';
import { SECCION_POR_CATEGORIA } from '../../../core/constants/categorias.constants';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { IDIOMA } from '../../../core/constants/regional.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../../core/utils/categoria-noticia';
import { minutosDeLectura } from '../../../core/utils/noticia';
import { Miniatura } from '../../../shared/miniatura/miniatura';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long', timeStyle: 'short' });

/**
 * La noticia completa: imagen, antetítulo, titular, resumen destacado y cuerpo.
 * La usan igual la vista rápida de la portada y la página de la noticia.
 */
@Component({
  selector: 'app-contenido-noticia',
  imports: [Miniatura],
  templateUrl: './contenido-noticia.html',
  styleUrl: './contenido-noticia.css',
})
export class ContenidoNoticia {
  readonly noticia = input.required<Noticia>();
  /** id del titular: quien muestra la noticia lo usa para nombrar el diálogo o la página. */
  readonly idTitulo = input.required<string>();
  /** h1 cuando la noticia es la página entera; h2 dentro de la vista rápida. */
  readonly nivelTitulo = input<1 | 2>(2);

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly seccion = computed(() => SECCION_POR_CATEGORIA[this.categoria()]);
  protected readonly minutosLectura = computed(() => minutosDeLectura(this.noticia().contenido));

  protected readonly fecha = computed(() => {
    const fecha = new Date(this.noticia().fechaPublicacion);
    return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
  });

  /** El cuerpo llega como texto plano: cada salto de línea separa un párrafo. */
  protected readonly parrafos = computed(() =>
    this.noticia()
      .contenido.split(/\n+/)
      .map((parrafo) => parrafo.trim())
      .filter((parrafo) => parrafo !== ''),
  );
}
