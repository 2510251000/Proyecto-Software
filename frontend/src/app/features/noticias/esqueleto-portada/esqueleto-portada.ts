import { Component } from '@angular/core';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';

/** Cuántas tarjetas grises de cada tipo se dibujan mientras carga. */
const GRANDES = [1, 2];
const COMPACTAS = [1, 2, 3, 4];

/** Forma gris de la portada mientras llegan las noticias. El texto solo lo oyen los lectores de pantalla. */
@Component({
  selector: 'app-esqueleto-portada',
  templateUrl: './esqueleto-portada.html',
  styleUrl: './esqueleto-portada.css',
})
export class EsqueletoPortada {
  protected readonly textos = TEXTOS_COMUNES;
  protected readonly grandes = GRANDES;
  protected readonly compactas = COMPACTAS;
}
