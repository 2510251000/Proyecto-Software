import { Component, computed, input, output, signal } from '@angular/core';
import {
  anuncioHora,
  ARCO,
  etiquetaMarca,
  GUIAS_ARCO,
  HORAS_DEL_DIA,
  MINUTOS_POR_HORA,
  TEXTOS_LINEA_SOL,
} from '../../../core/constants/dia-en-vivo.constants';
import { horaEnArco, horaLegible, MarcaArco, posicionEnArco } from '../../../core/utils/dia-en-vivo';

/** Cada línea necesita un id propio para enlazar el deslizador con su etiqueta. */
let lineasCreadas = 0;

/**
 * La línea del sol: un arco de 6 a. m. a 6 p. m. con el sol en la hora que se está viendo y
 * una marca por cada noticia del día. Se vuelve atrás arrastrando el deslizador (el botón
 * redondo queda justo debajo del sol) o tocando una marca.
 */
@Component({
  selector: 'app-linea-sol',
  templateUrl: './linea-sol.html',
  styleUrl: './linea-sol.css',
})
export class LineaSol {
  /** La hora que se está viendo, como decimal (17.67 = 5:40 p. m.). */
  readonly hora = input.required<number>();
  readonly marcas = input<readonly MarcaArco[]>([]);
  /** La noticia que está en la portada de cine: su marca va resaltada. */
  readonly idActiva = input<number | null>(null);
  /** Hasta qué hora se puede llevar el deslizador: la hora actual hoy, o las 6 p. m. en un día pasado. */
  readonly maximo = input<number>(HORAS_DEL_DIA.ocaso);
  /** Titular de la noticia en portada: se anuncia junto con la hora al soltar el deslizador. */
  readonly titular = input('');

  /** La hora que eligió el usuario, al arrastrar o al tocar una marca. */
  readonly elegida = output<number>();

  protected readonly textos = TEXTOS_LINEA_SOL;
  protected readonly arco = ARCO;
  protected readonly idRango = `rango-sol-${++lineasCreadas}`;
  protected readonly minimo = HORAS_DEL_DIA.amanecer * MINUTOS_POR_HORA;
  protected readonly guias = GUIAS_ARCO.map(({ hora, texto }) => ({ texto, x: posicionEnArco(hora).x }));

  protected readonly sol = computed(() => posicionEnArco(this.hora()));
  protected readonly horaTexto = computed(() => horaLegible(horaEnArco(this.hora())));

  // El deslizador trabaja en minutos enteros (360 = 6:00 a. m.) para no arrastrar decimales.
  protected readonly minutos = computed(() => Math.round(horaEnArco(this.hora()) * MINUTOS_POR_HORA));
  protected readonly maximoMinutos = computed(() => Math.round(horaEnArco(this.maximo()) * MINUTOS_POR_HORA));
  /** Antes de las 6 a. m. no hay nada que recorrer. */
  protected readonly sinRecorrido = computed(() => this.maximoMinutos() <= this.minimo);
  /** El riel llega hasta la hora máxima: así el botón siempre queda debajo del sol. */
  protected readonly anchoRiel = computed(() => posicionEnArco(this.maximo()).x - ARCO.xInicio);

  /** La hora en la que se soltó el deslizador; mientras se arrastra no se anuncia nada. */
  private readonly horaSoltada = signal<number | null>(null);
  protected readonly anuncio = computed(() =>
    this.horaSoltada() === this.minutos() ? anuncioHora(this.horaTexto(), this.titular()) : '',
  );

  protected horaDe(marca: MarcaArco): string {
    return horaLegible(marca.hora);
  }

  protected etiqueta(marca: MarcaArco): string {
    return etiquetaMarca(horaLegible(marca.hora), marca.noticia.titulo);
  }

  protected mover(evento: Event): void {
    const minutos = this.valor(evento);
    if (minutos !== null) {
      this.horaSoltada.set(null);
      this.elegida.emit(minutos / MINUTOS_POR_HORA);
    }
  }

  protected soltar(evento: Event): void {
    this.horaSoltada.set(this.valor(evento));
  }

  private valor(evento: Event): number | null {
    return evento.target instanceof HTMLInputElement ? Number(evento.target.value) : null;
  }
}
