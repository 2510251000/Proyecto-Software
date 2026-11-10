import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  TEXTOS_COLUMNA,
  textoBarraNivel,
  textoFaltanPuntos,
  textoLimiteDiario,
} from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';

/** «Tu nivel»: nivel, puntos con la barra ámbar, cuánto falta, el límite diario y Mi perfil. */
@Component({
  selector: 'app-tu-nivel',
  imports: [RouterLink],
  templateUrl: './tu-nivel.html',
  styleUrl: './tu-nivel.css',
})
export class TuNivel {
  readonly perfil = input.required<Perfil>();

  protected readonly textos = TEXTOS_COLUMNA;
  protected readonly rutaPerfil = ['/', RUTAS.perfil];

  /** Puntos que pide el siguiente nivel; null si ya está en el más alto. */
  protected readonly meta = computed(() => this.perfil().siguienteNivel?.puntajeMinimo ?? null);

  protected readonly progreso = computed(() => {
    const meta = this.meta();
    return meta ? Math.min(100, Math.round((this.perfil().puntaje / meta) * 100)) : 100;
  });

  protected readonly faltan = computed(() => {
    const siguiente = this.perfil().siguienteNivel;
    if (!siguiente) {
      return TEXTOS_COLUMNA.maximo;
    }
    return textoFaltanPuntos(Math.max(0, siguiente.puntajeMinimo - this.perfil().puntaje), siguiente.numero);
  });

  protected readonly etiquetaBarra = computed(() => {
    const siguiente = this.perfil().siguienteNivel;
    return siguiente ? textoBarraNivel(this.perfil().puntaje, siguiente.puntajeMinimo, siguiente.numero) : this.faltan();
  });

  protected readonly limite = computed(() => {
    const { cupo } = this.perfil();
    return cupo.ilimitado ? TEXTOS_COLUMNA.ilimitado : textoLimiteDiario(cupo.limite);
  });
}
