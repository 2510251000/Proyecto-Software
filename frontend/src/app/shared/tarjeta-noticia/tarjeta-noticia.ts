import { Component, computed, input, output } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../core/constants/portada.constants';
import { IDIOMA } from '../../core/constants/regional.constants';
import { Noticia } from '../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../core/utils/categoria-noticia';
import { portadaDe } from '../../core/utils/imagenes';
import { minutosDeLectura } from '../../core/utils/noticia';
import { EnlaceNoticia } from '../enlace-noticia/enlace-noticia';
import { Miniatura } from '../miniatura/miniatura';
import { AutorNoticia } from './autor-noticia/autor-noticia';

const FORMATO_PROMEDIO = new Intl.NumberFormat(IDIOMA, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Cada nota necesita ids propios para enlazar su titular con su descripción. */
let notasCreadas = 0;

export type VarianteTarjeta = 'grande' | 'compacta';

/**
 * Una noticia en la portada. «grande»: autor, titular, resumen, foto 2:1 y pie con
 * municipio, lectura y calificación. «compacta»: miniatura, autor, titular y municipio.
 * Las dos abren la vista rápida igual (appEnlaceNoticia).
 */
@Component({
  selector: 'app-tarjeta-noticia',
  imports: [AutorNoticia, Miniatura, EnlaceNoticia],
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
})
export class TarjetaNoticia {
  readonly noticia = input.required<Noticia>();
  readonly variante = input<VarianteTarjeta>('compacta');
  /** Clic normal en la nota: quien la usa decide cómo mostrar la noticia. */
  readonly abrir = output<Noticia>();

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  private readonly numero = ++notasCreadas;
  protected readonly idTitulo = `nota-${this.numero}-titulo`;
  protected readonly idAutor = `nota-${this.numero}-autor`;
  protected readonly idDatos = `nota-${this.numero}-datos`;

  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly portada = computed(() => portadaDe(this.noticia()));
  protected readonly minutos = computed(() => minutosDeLectura(this.noticia().contenido));
  protected readonly calificaciones = computed(() => this.noticia().cantidadCalificaciones ?? 0);
  protected readonly promedio = computed(() => FORMATO_PROMEDIO.format(this.noticia().promedio ?? 0));
}
