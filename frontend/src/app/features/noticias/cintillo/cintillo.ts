import { Component, input } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';

/** Franja roja de «Última hora» que va encima de toda la portada. */
@Component({
  selector: 'app-cintillo',
  templateUrl: './cintillo.html',
  styleUrl: './cintillo.css',
})
export class Cintillo {
  readonly noticia = input.required<Noticia>();

  protected readonly etiquetas = ETIQUETAS_NOTICIA;
}
