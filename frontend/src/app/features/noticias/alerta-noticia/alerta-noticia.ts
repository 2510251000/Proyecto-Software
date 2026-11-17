import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NOMBRES_ALERTA, TEXTOS_ALERTA } from '../../../core/constants/alertas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { Alerta } from '../../../core/models/alerta.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AlertaService } from '../../../core/services/alerta.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Franja de la página de una noticia que es alerta de emergencia: si sigue activa o ya se
 * resolvió y, para el autor o un administrador, el botón para darla por resuelta.
 * En una noticia normal no muestra nada.
 */
@Component({
  selector: 'app-alerta-noticia',
  templateUrl: './alerta-noticia.html',
  styleUrl: './alerta-noticia.css',
})
export class AlertaNoticia {
  private readonly servicio = inject(AlertaService);
  private readonly sesion = inject(AuthService).obtenerContenidoToken();

  readonly noticiaId = input.required<number>();

  protected readonly textos = TEXTOS_ALERTA;
  protected readonly nombres = NOMBRES_ALERTA;
  protected readonly alerta = signal<Alerta | null>(null);
  protected readonly resolviendo = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly puedeResolver = computed(() => {
    const alerta = this.alerta();
    return (
      alerta !== null &&
      alerta.activa &&
      this.sesion !== null &&
      (this.sesion.rol === ROLES.administrador || this.sesion.id === alerta.autorId)
    );
  });

  constructor() {
    effect(() => {
      const id = this.noticiaId();
      untracked(() => {
        this.alerta.set(null);
        // 404: la noticia no es una alerta y no se muestra nada.
        this.servicio
          .deNoticia(id)
          .subscribe({ next: (alerta) => this.alerta.set(alerta), error: () => undefined });
      });
    });
  }

  protected resolver(): void {
    if (this.resolviendo() || !globalThis.confirm(TEXTOS_ALERTA.confirmarResolver)) {
      return;
    }
    this.resolviendo.set(true);
    this.error.set(null);
    this.servicio.resolver(this.noticiaId()).subscribe({
      next: (alerta) => {
        this.alerta.set(alerta);
        this.resolviendo.set(false);
      },
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.resolviendo.set(false);
      },
    });
  }
}
