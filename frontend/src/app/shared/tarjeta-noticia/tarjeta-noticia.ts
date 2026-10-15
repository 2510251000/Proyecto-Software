import { Component, computed, input, output } from '@angular/core';
import { SECCION_POR_CATEGORIA } from '../../core/constants/categorias.constants';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { IDIOMA } from '../../core/constants/regional.constants';
import { Noticia } from '../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../core/utils/categoria-noticia';
import { esUltimaHora, tiempoRelativo } from '../../core/utils/noticia';
import { EnlaceNoticia } from '../enlace-noticia/enlace-noticia';
import { Miniatura } from '../miniatura/miniatura';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long' });

/** Cada nota necesita ids propios para enlazar su titular y su descripción. */
let notasCreadas = 0;

/** Una noticia en las listas de la portada: sección, titular, resumen y datos, con la foto al lado. */
@Component({
  selector: 'app-tarjeta-noticia',
  imports: [Miniatura, EnlaceNoticia],
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
})
export class TarjetaNoticia {
  readonly noticia = input.required<Noticia>();
  /** Clic normal en la nota: quien la usa decide cómo mostrar la noticia. */
  readonly abrir = output<Noticia>();

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  private readonly numero = ++notasCreadas;
  protected readonly idTitulo = `nota-${this.numero}-titulo`;
  protected readonly idSeccion = `nota-${this.numero}-seccion`;
  protected readonly idDatos = `nota-${this.numero}-datos`;

  /** Fecha completa: se muestra al dejar el mouse sobre la hora relativa. */
  protected readonly fecha = computed(() => {
    const fecha = new Date(this.noticia().fechaPublicacion);
    return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
  });

  protected readonly cuando = computed(() => tiempoRelativo(this.noticia().fechaPublicacion));
  protected readonly ultimaHora = computed(() => esUltimaHora(this.noticia()));
  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly seccion = computed(() => SECCION_POR_CATEGORIA[this.categoria()]);
}
