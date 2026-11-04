import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TIEMPOS_HOY } from '../../../core/constants/animaciones.constants';
import { TEXTOS_HOY } from '../../../core/constants/hoy.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';

/**
 * Bloque sólido de abajo de cada historia: etiqueta, titular palabra por palabra, resumen y
 * el enlace a la noticia. Fondo de noche sin degradado, texto en blanco.
 */
@Component({
  selector: 'app-texto-historia',
  imports: [RouterLink],
  templateUrl: './texto-historia.html',
  styleUrl: './texto-historia.css',
})
export class TextoHistoria {
  readonly noticia = input.required<Noticia>();
  /** Con «reducir movimiento» el titular aparece de una vez. */
  readonly sinMovimiento = input(false);

  protected readonly textos = TEXTOS_HOY;
  protected readonly rutas = RUTAS;
  protected readonly palabras = computed(() => this.noticia().titulo.split(/\s+/).filter(Boolean));

  protected retrasoPalabra(posicion: number): number {
    return TIEMPOS_HOY.inicioPalabras + posicion * TIEMPOS_HOY.pasoPalabra;
  }
}
