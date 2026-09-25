import { Component, computed, input } from '@angular/core';
import { NOMBRE_PORTAL, TAMANO_MINIMO_LOGO_COMPLETO } from '../../core/constants/marca.constants';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  /** Lado del isotipo en píxeles. */
  readonly tamano = input(40);
  readonly variante = input<'completo' | 'reducido'>('completo');
  /** Muestra la palabra «Al Día» al lado del isotipo. */
  readonly conNombre = input(false);

  protected readonly nombre = NOMBRE_PORTAL;

  /** Por debajo del tamaño mínimo siempre se usa la versión reducida, aunque se pida la completa. */
  protected readonly reducido = computed(
    () => this.variante() === 'reducido' || this.tamano() < TAMANO_MINIMO_LOGO_COMPLETO,
  );
}
