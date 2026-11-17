import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, Subscription, switchMap, timer } from 'rxjs';
import { INTERVALO_ALERTAS_MS } from '../constants/alertas.constants';
import { AlertaPendiente } from '../models/alerta.model';
import { AlertaService } from './alerta.service';
import { CampanaNotificaciones } from './campana-notificaciones';
import { NotificacionService } from './notificacion.service';

/**
 * Pregunta al backend cada INTERVALO_ALERTAS_MS si llegó una alerta de emergencia que el
 * usuario no ha visto. La primera de la fila es la que se muestra a pantalla completa.
 */
@Injectable({ providedIn: 'root' })
export class VigiaAlertas {
  private readonly alertas = inject(AlertaService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly campana = inject(CampanaNotificaciones);
  private suscripcion: Subscription | null = null;
  private interesados = 0;
  /** Notificaciones ya cerradas en esta sesión: no vuelven a saltar aunque la consulta llegue tarde. */
  private readonly cerradas = new Set<number>();

  private readonly _pendientes = signal<AlertaPendiente[]>([]);
  readonly pendientes = this._pendientes.asReadonly();
  readonly actual = computed(() => this._pendientes()[0] ?? null);

  /** Empieza a preguntar (si nadie lo había hecho) y deja de hacerlo cuando se destruye quien llamó. */
  vigilar(destruccion: DestroyRef): void {
    this.interesados++;
    if (this.suscripcion === null) {
      this.suscripcion = timer(0, INTERVALO_ALERTAS_MS)
        .pipe(switchMap(() => this.alertas.pendientes().pipe(catchError(() => EMPTY))))
        .subscribe((pendientes) =>
          this._pendientes.set(pendientes.filter((p) => !this.cerradas.has(p.notificacionId))),
        );
    }
    destruccion.onDestroy(() => {
      this.interesados--;
      if (this.interesados === 0) {
        this.suscripcion?.unsubscribe();
        this.suscripcion = null;
      }
    });
  }

  /** El usuario cerró el aviso: sale de la fila de una vez y se marca como leído en el backend. */
  cerrar(pendiente: AlertaPendiente): void {
    this.cerradas.add(pendiente.notificacionId);
    this._pendientes.update((fila) =>
      fila.filter((p) => p.notificacionId !== pendiente.notificacionId),
    );
    this.notificaciones.marcarLeida(pendiente.notificacionId).subscribe({
      next: () => this.campana.actualizar(),
      error: () => undefined,
    });
  }
}
