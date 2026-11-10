import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ANILLO_NIVEL,
  TEXTOS_FICHA_NIVEL,
  textoCupoRestante,
  textoPuntosNivel,
  textoTeFaltan,
} from '../../../core/constants/dia-en-vivo.constants';
import { TEXTOS_COLUMNA, textoBarraNivel } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { avanceNivel } from '../../../core/utils/dia-en-vivo';

/** Largo de la circunferencia del anillo: con él se dibuja la parte llena. */
const CIRCUNFERENCIA = 2 * Math.PI * ANILLO_NIVEL.radio;

/**
 * Ficha «Tu nivel» del mosaico: un anillo ámbar con el avance hacia el siguiente nivel y el
 * nivel en el centro; debajo, los puntos, cuánto falta, el cupo de hoy y «Publicar una noticia».
 */
@Component({
  selector: 'app-tu-nivel',
  imports: [RouterLink],
  templateUrl: './tu-nivel.html',
  styleUrl: './tu-nivel.css',
})
export class TuNivel {
  readonly perfil = input.required<Perfil>();

  protected readonly textos = TEXTOS_FICHA_NIVEL;
  protected readonly nivel = TEXTOS_COLUMNA.nivel;
  protected readonly anillo = ANILLO_NIVEL;
  protected readonly centro = ANILLO_NIVEL.caja / 2;
  protected readonly rutaPublicar = ['/', RUTAS.publicar];

  /** Puntos que pide el siguiente nivel; null si ya está en el más alto. */
  private readonly meta = computed(() => this.perfil().siguienteNivel?.puntajeMinimo ?? null);

  /** «130.7 326.7»: el trazo lleno y el hueco que completa la vuelta. */
  protected readonly trazoLleno = computed(() => {
    const lleno = avanceNivel(this.perfil().puntaje, this.meta()) * CIRCUNFERENCIA;
    return `${lleno.toFixed(1)} ${CIRCUNFERENCIA.toFixed(1)}`;
  });

  protected readonly puntos = computed(() => textoPuntosNivel(this.perfil().puntaje, this.meta()));

  protected readonly faltan = computed(() => {
    const siguiente = this.perfil().siguienteNivel;
    if (!siguiente) {
      return TEXTOS_FICHA_NIVEL.maximo;
    }
    return textoTeFaltan(
      Math.max(0, siguiente.puntajeMinimo - this.perfil().puntaje),
      siguiente.numero,
    );
  });

  /** Lo que dice el anillo a los lectores de pantalla. */
  protected readonly etiquetaAnillo = computed(() => {
    const siguiente = this.perfil().siguienteNivel;
    return siguiente
      ? textoBarraNivel(this.perfil().puntaje, siguiente.puntajeMinimo, siguiente.numero)
      : this.faltan();
  });

  /** «9 de 10», o null si publica sin límite. */
  protected readonly cupo = computed(() => {
    const { cupo } = this.perfil();
    return cupo.ilimitado ? null : textoCupoRestante(cupo.restantes ?? 0, cupo.limite);
  });

  protected readonly ilimitado = TEXTOS_COLUMNA.ilimitado;
}
