import { Component } from '@angular/core';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';

const TARJETAS = [1, 2, 3];

/** Forma gris de la portada mientras llegan las noticias. El texto solo lo oyen los lectores de pantalla. */
@Component({
  selector: 'app-esqueleto-portada',
  templateUrl: './esqueleto-portada.html',
  styleUrl: './esqueleto-portada.css',
})
export class EsqueletoPortada {
  protected readonly textos = TEXTOS_COMUNES;
  protected readonly tarjetas = TARJETAS;
}
