import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, SUFIJOS } from '../constants/endpoints.constants';
import { ConteoNotificaciones, Notificacion } from '../models/notificacion.model';
import { conErrorApi } from './error-http';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}${ENDPOINTS.notificaciones}`;

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.url).pipe(conErrorApi());
  }

  contarNoLeidas(): Observable<number> {
    return this.http
      .get<ConteoNotificaciones>(`${environment.apiUrl}${ENDPOINTS.notificacionesNoLeidas}`)
      .pipe(
        map((conteo) => conteo.cantidad),
        conErrorApi(),
      );
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/${SUFIJOS.leida}`, null).pipe(conErrorApi());
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http
      .put<void>(`${environment.apiUrl}${ENDPOINTS.notificacionesLeidas}`, null)
      .pipe(conErrorApi());
  }
}
