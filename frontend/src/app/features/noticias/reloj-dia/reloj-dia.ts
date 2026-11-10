import { Component, computed, input, output } from '@angular/core';
import { TEXTOS_RELOJ, textoDiaSinNoticias } from '../../../core/constants/dia-en-vivo.constants';
import { fechaLegible, partesDeHora } from '../../../core/utils/dia-en-vivo';

/**
 * Tarjeta del reloj de la portada de cine: la hora que se está viendo en grande, el día y el
 * municipio, y «Volver a ahora» cuando el usuario se fue atrás en el día.
 */
@Component({
  selector: 'app-reloj-dia',
  templateUrl: './reloj-dia.html',
  styleUrl: './reloj-dia.css',
})
export class RelojDia {
  /** La hora que se está viendo, como decimal (17.67 = 5:40 p. m.). */
  readonly hora = input.required<number>();
  /** El día que se está viendo, como «2026-11-09». */
  readonly dia = input.required<string>();
  /** Municipio elegido; null cuando se ven todos. */
  readonly municipio = input<string | null>(null);
  /** true si lo que se ve es el momento actual: hoy y sin haberse ido atrás. */
  readonly enVivo = input(true);
  /** true si el usuario eligió otra hora u otro día: aparece «Volver a ahora». */
  readonly deViaje = input(false);
  /** true si el día que se ve no tiene noticias (por el municipio elegido). */
  readonly sinNoticias = input(false);
  /** false cuando no hay noticias más viejas que las del día que se ve. */
  readonly hayAnterior = input(false);
  /** false cuando el día que se ve ya es hoy. */
  readonly haySiguiente = input(false);

  readonly volver = output<void>();
  readonly anterior = output<void>();
  readonly siguiente = output<void>();

  protected readonly textos = TEXTOS_RELOJ;
  protected readonly partes = computed(() => partesDeHora(this.hora()));

  /** «Lunes 9 de noviembre · Fusagasugá», o solo la fecha si se ven todos los municipios. */
  protected readonly fecha = computed(() => {
    const fecha = fechaLegible(this.dia());
    const municipio = this.municipio();
    return municipio ? `${fecha} · ${municipio}` : fecha;
  });

  protected readonly aviso = computed(() => textoDiaSinNoticias(this.municipio()));
}
