import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { TEXTOS_CALIFICACION, textoAprobacion } from '../../../../core/constants/interaccion.constants';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Noticia } from '../../../../core/models/noticia.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InteraccionService } from '../../../../core/services/interaccion.service';

/**
 * Calificar al autor desde su noticia (HU MF03_002): dos botones, «Sigue publicando así» y
 * «No me gustó esto». El botón elegido queda marcado (aria-pressed) y se puede cambiar.
 * Muestra la aprobación del autor en todas sus noticias. Nadie se vota a sí mismo.
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

  protected readonly aprobacion = linkedSignal(() => this.noticia().autorAprobacion ?? null);
  protected readonly votos = linkedSignal(() => this.noticia().autorVotos ?? 0);
  readonly miVoto = linkedSignal(() => this.noticia().miVoto ?? null);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly esPropia = computed(() => {
    const autorId = this.noticia().autorId;
    return this.sesion !== null && autorId !== undefined && autorId !== null && autorId === this.sesion.id;
  });

  protected readonly pregunta = computed(
    () => `${this.textos.pregunta} ${this.noticia().autor ?? this.textos.autorGenerico}?`,
  );

  protected readonly resumen = computed(
    () => textoAprobacion(this.aprobacion(), this.votos()) ?? this.textos.sinVotos,
  );

  votar(recomienda: boolean): void {
    if (this.esPropia() || this.guardando()) {
      return;
    }
    const anterior = this.miVoto();
    this.miVoto.set(recomienda);
    this.guardando.set(true);
    this.error.set(null);
    this.interaccion.calificar(this.noticia().id, recomienda).subscribe({
      next: (resultado) => {
        this.aprobacion.set(resultado.autorAprobacion);
        this.votos.set(resultado.autorVotos);
        this.miVoto.set(resultado.miVoto);
        this.mensaje.set(this.textos.gracias);
        this.guardando.set(false);
      },
      error: (error: ErrorApi) => {
        this.miVoto.set(anterior);
        this.error.set(error.mensaje);
        this.guardando.set(false);
      },
    });
  }
}
