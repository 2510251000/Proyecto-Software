import { Component, computed, input, output } from '@angular/core';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { IDIOMA } from '../../../core/constants/regional.constants';
import { Logo } from '../../../shared/logo/logo';
import { Navegacion } from '../../../shared/navegacion/navegacion';

export interface ConteoCiudad {
  ciudad: string;
  cantidad: number;
}

const FORMATO_DIA = new Intl.DateTimeFormat(IDIOMA, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/**
 * Cabecera de la portada: la banda azul del amanecer con el municipio elegido en grande,
 * la fecha de hoy y el selector de municipios con cuántas noticias tiene cada uno.
 */
@Component({
  selector: 'app-cabecera-portada',
  imports: [Logo, Navegacion],
  templateUrl: './cabecera-portada.html',
  styleUrl: './cabecera-portada.css',
})
export class CabeceraPortada {
  readonly ciudades = input<readonly ConteoCiudad[]>([]);
  /** Municipio elegido; null cuando se ven todos. */
  readonly ciudadActiva = input<string | null>(null);
  readonly total = input(0);
  readonly elegir = output<string | null>();

  protected readonly textos = TEXTOS_PORTADA;

  protected readonly lugar = computed(() => this.ciudadActiva() ?? TEXTOS_PORTADA.tuRegion);

  /** «Martes, 14 de octubre». */
  protected readonly hoy = computed(() => {
    const texto = FORMATO_DIA.format(new Date());
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });

  protected cantidad(n: number): string {
    return `${n} ${n === 1 ? TEXTOS_PORTADA.noticia : TEXTOS_PORTADA.noticias}`;
  }
}
