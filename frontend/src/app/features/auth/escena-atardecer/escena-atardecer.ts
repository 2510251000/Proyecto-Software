import { Component } from '@angular/core';
import { NOMBRE_PORTAL, TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';

/**
 * La entrada del login: el sol sale sobre las tres barras del isotipo, se oculta tras el
 * horizonte y se van el nombre y el lema. Es decoración: quien la usa la marca aria-hidden.
 * Toma la duración total de --duracion-entrada (la pone el login).
 */
@Component({
  selector: 'app-escena-atardecer',
  templateUrl: './escena-atardecer.html',
  styleUrl: './escena-atardecer.css',
})
export class EscenaAtardecer {
  protected readonly nombrePortal = NOMBRE_PORTAL;
  protected readonly lema = TEXTOS_PANEL_MARCA.titularLogin;
}
