import { Component, computed, input } from '@angular/core';
import { IDIOMA } from '../../core/constants/regional.constants';
import { Noticia } from '../../core/models/noticia.model';

const FORMATO_FECHA = new Intl.DateTimeFormat(IDIOMA, { dateStyle: 'long' });

@Component({
  selector: 'app-tarjeta-noticia',
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
})
export class TarjetaNoticia {
  readonly noticia = input.required<Noticia>();

  protected readonly fecha = computed(() => {
    const fecha = new Date(this.noticia().fechaPublicacion);
    return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
  });
}
