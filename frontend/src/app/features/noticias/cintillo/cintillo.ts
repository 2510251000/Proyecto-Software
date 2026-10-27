import { Component, input, output } from '@angular/core';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { EnlaceNoticia } from '../../../shared/enlace-noticia/enlace-noticia';

/** Franja de «Última hora» que va encima de toda la portada. */
@Component({
  selector: 'app-cintillo',
  imports: [EnlaceNoticia],
  templateUrl: './cintillo.html',
  styleUrl: './cintillo.css',
})
export class Cintillo {
  readonly noticia = input.required<Noticia>();
  readonly abrir = output<Noticia>();

  protected readonly etiquetas = ETIQUETAS_NOTICIA;
}
