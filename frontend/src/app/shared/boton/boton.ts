import { Component, input } from '@angular/core';
import { TEXTOS_COMUNES } from '../../core/constants/mensajes.constants';

@Component({
  selector: 'app-boton',
  templateUrl: './boton.html',
  styleUrl: './boton.css',
})
export class Boton {
  readonly tipo = input<'button' | 'submit'>('button');
  readonly cargando = input(false);
  readonly deshabilitado = input(false);
  readonly bloque = input(false);
  readonly variante = input<'primaria' | 'secundaria'>('primaria');

  protected readonly textos = TEXTOS_COMUNES;
}
