import { Component, input } from '@angular/core';
import { CategoriaMiniatura } from '../../core/models/categoria-miniatura.model';

/** Dibujo que reemplaza la foto de la noticia mientras no exista la tabla multimedia (RF8). */
@Component({
  selector: 'app-miniatura',
  templateUrl: './miniatura.html',
  styleUrl: './miniatura.css',
})
export class Miniatura {
  readonly categoria = input.required<CategoriaMiniatura>();
}
