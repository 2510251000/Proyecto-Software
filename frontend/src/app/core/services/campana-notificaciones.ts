import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, Subscription, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificacionService } from './notificacion.service';

/**
 * Cuántas notificaciones sin leer tiene el usuario. Mientras haya un menú en pantalla
 * pregunta al backend cada environment.intervaloNotificacionesMs.
 */
@Injectable({ providedIn: 'root' })
export class CampanaNotificaciones {
  private readonly servicio = inject(NotificacionService);
  private suscripcion: Subscription | null = null;
  private interesados = 0;

  private readonly _noLeidas = signal(0);
  readonly noLeidas = this._noLeidas.asReadonly();

  /** Empieza a preguntar (si nadie lo había hecho) y deja de hacerlo cuando se destruye quien llamó. */
  vigilar(destruccion: DestroyRef): void {
    this.interesados++;
    if (this.suscripcion === null) {
      this.suscripcion = timer(0, environment.intervaloNotificacionesMs)
        .pipe(
          // Si una consulta falla (por ejemplo, sin red) la campana conserva el último valor.
          switchMap(() => this.servicio.contarNoLeidas().pipe(catchError(() => EMPTY))),
        )
        .subscribe((cantidad) => this._noLeidas.set(cantidad));
    }
    destruccion.onDestroy(() => {
      this.interesados--;
      if (this.interesados === 0) {
        this.detener();
      }
    });
  }

  /** Para cuando se lee algo en la bandeja: la campana se actualiza sin esperar. */
  actualizar(): void {
    this.servicio.contarNoLeidas().subscribe({ next: (cantidad) => this._noLeidas.set(cantidad) });
  }

  private detener(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = null;
  }
}
