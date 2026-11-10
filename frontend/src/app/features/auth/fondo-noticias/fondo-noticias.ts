import { Component } from '@angular/core';
import { RECORTES_FONDO_LOGIN } from '../../../core/constants/fondo-login.constants';

/**
 * Fondo del login: un muro de recortes de periódico (foto, sección y titular) difuminado y
 * con un velo azul encima. Es pura decoración, por eso todo va con aria-hidden.
 * Los recortes se repiten dos veces para que el muro llene pantallas grandes.
 */
@Component({
  selector: 'app-fondo-noticias',
  templateUrl: './fondo-noticias.html',
  styleUrl: './fondo-noticias.css',
})
export class FondoNoticias {
  protected readonly recortes = [...RECORTES_FONDO_LOGIN, ...RECORTES_FONDO_LOGIN];
}
