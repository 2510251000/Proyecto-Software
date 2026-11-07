import { Component, computed, input } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { IDIOMA } from '../../../core/constants/regional.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { esUltimaHora, tiempoRelativo } from '../../../core/utils/noticia';
import { iniciales } from '../../../core/utils/texto';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long' });

/**
 * Fila de autor de una tarjeta: quién la publicó, «Oficial» o «Nivel N», hace cuánto y,
 * si aplica, «Última hora». Con `conAvatar` lleva delante el cuadro de 36px.
 */
@Component({
  selector: 'app-autor-noticia',
  templateUrl: './autor-noticia.html',
  styleUrl: './autor-noticia.css',
})
export class AutorNoticia {
  readonly noticia = input.required<Noticia>();
  readonly conAvatar = input(false);

  protected readonly etiquetas = ETIQUETAS_NOTICIA;

  protected readonly autor = computed(() => {
    const noticia = this.noticia();
    const nombre = noticia.autor?.trim();
    if (nombre) {
      return nombre;
    }
    return noticia.oficial ? ETIQUETAS_NOTICIA.autorOficial : ETIQUETAS_NOTICIA.autorComunidad;
  });

  protected readonly iniciales = computed(() => iniciales(this.autor()));
  protected readonly cuando = computed(() => tiempoRelativo(this.noticia().fechaPublicacion));
  protected readonly ultimaHora = computed(() => esUltimaHora(this.noticia()));

  /** Fecha completa: se muestra al dejar el mouse sobre la hora relativa. */
  protected readonly fecha = computed(() => {
    const fecha = new Date(this.noticia().fechaPublicacion);
    return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
  });
}
