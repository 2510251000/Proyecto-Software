import { Component, input, output } from '@angular/core';
import { TEXTOS_HOY } from '../../../core/constants/hoy.constants';
import { Noticia } from '../../../core/models/noticia.model';

/** Columna izquierda de «Hoy» en escritorio: municipio, fecha y titulares numerados. */
@Component({
  selector: 'app-lista-historias',
  templateUrl: './lista-historias.html',
  styleUrl: './lista-historias.css',
})
export class ListaHistorias {
  readonly historias = input.required<Noticia[]>();
  readonly indice = input.required<number>();
  readonly municipio = input.required<string>();
  readonly fecha = input.required<string>();
  /** Se tocó un titular: su posición en la lista. */
  readonly elegir = output<number>();

  protected readonly textos = TEXTOS_HOY;
}
