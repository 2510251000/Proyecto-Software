import { Component } from '@angular/core';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';

/** Fichas grises de cada fila del mosaico mientras carga: la primera con 3 y la segunda con 4. */
const FILA_1 = ['grande', 'mapa', 'nivel'] as const;
const FILA_2 = [1, 2, 3, 4];

/**
 * Forma de la portada mientras llegan las noticias: el bloque oscuro de la portada de cine y,
 * debajo, las fichas del mosaico. El texto solo lo oyen los lectores de pantalla.
 */
@Component({
  selector: 'app-esqueleto-portada',
  templateUrl: './esqueleto-portada.html',
  styleUrl: './esqueleto-portada.css',
})
export class EsqueletoPortada {
  protected readonly textos = TEXTOS_COMUNES;
  protected readonly fila1 = FILA_1;
  protected readonly fila2 = FILA_2;
}
