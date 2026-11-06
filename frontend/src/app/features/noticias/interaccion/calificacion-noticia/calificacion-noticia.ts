import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { ESTRELLAS, TEXTOS_CALIFICACION } from '../../../../core/constants/interaccion.constants';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Noticia } from '../../../../core/models/noticia.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InteraccionService } from '../../../../core/services/interaccion.service';

/**
 * Calificar de 1 a 5 estrellas (HU MF03_002). Es un grupo de radios: con teclado se elige con
 * las flechas. Muestra el promedio y cuántas calificaciones hay. El autor no puede calificarse.
 */
@Component({
  selector: 'app-calificacion-noticia',
  templateUrl: './calificacion-noticia.html',
  styleUrl: './calificacion-noticia.css',
})
export class CalificacionNoticia {
  private readonly interaccion = inject(InteraccionService);
  private readonly sesion = inject(AuthService).obtenerContenidoToken();

  readonly noticia = input.required<Noticia>();

  protected readonly textos = TEXTOS_CALIFICACION;
  protected readonly estrellas = ESTRELLAS;

  protected readonly promedio = linkedSignal(() => this.noticia().promedio ?? 0);
  protected readonly cantidad = linkedSignal(() => this.noticia().cantidadCalificaciones ?? 0);
  readonly mia = linkedSignal(() => this.noticia().miCalificacion ?? null);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly esPropia = computed(() => {
    const autorId = this.noticia().autorId;
    return this.sesion !== null && autorId !== undefined && autorId !== null && autorId === this.sesion.id;
  });

  protected readonly resumen = computed(() => {
    const cantidad = this.cantidad();
    if (cantidad === 0) {
      return this.textos.sinCalificaciones;
    }
    const palabra = cantidad === 1 ? this.textos.calificacion : this.textos.calificaciones;
    return `${this.textos.promedio}: ${this.promedio().toFixed(1)} · ${cantidad} ${palabra}`;
  });

  protected nombreEstrella(valor: number): string {
    return `${valor} ${valor === 1 ? this.textos.estrella : this.textos.estrellas}`;
  }

  calificar(valor: number): void {
    if (this.esPropia() || this.guardando()) {
      return;
    }
    const anterior = this.mia();
    this.mia.set(valor);
    this.guardando.set(true);
    this.error.set(null);
    this.interaccion.calificar(this.noticia().id, valor).subscribe({
      next: (resultado) => {
        this.promedio.set(resultado.promedio);
        this.cantidad.set(resultado.cantidadCalificaciones);
        this.mia.set(resultado.miCalificacion);
        this.mensaje.set(this.textos.gracias);
        this.guardando.set(false);
      },
      error: (error: ErrorApi) => {
        this.mia.set(anterior);
        this.error.set(error.mensaje);
        this.guardando.set(false);
      },
    });
  }
}
