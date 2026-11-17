import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, PARAMETROS_NOTICIAS, SUFIJOS } from '../constants/endpoints.constants';
import { Alerta, AlertaPendiente } from '../models/alerta.model';
import { conErrorApi } from './error-http';

/** Alertas de emergencia. Se crean publicando una noticia con el campo «alerta». */
@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}${ENDPOINTS.alertas}`;

  /** Las vigentes de una ciudad; sin ciudad, las de la ciudad del usuario. */
  vigentes(ciudadId?: number): Observable<Alerta[]> {
    const params =
      ciudadId === undefined
        ? new HttpParams()
        : new HttpParams().set(PARAMETROS_NOTICIAS.ciudad, ciudadId);
    return this.http.get<Alerta[]>(this.url, { params }).pipe(conErrorApi());
  }

  /** Las que el usuario aún no ha visto: se muestran a pantalla completa. */
  pendientes(): Observable<AlertaPendiente[]> {
    return this.http
      .get<AlertaPendiente[]>(`${environment.apiUrl}${ENDPOINTS.alertasPendientes}`)
      .pipe(conErrorApi());
  }

  /** La alerta de una noticia; responde con error 404 si la noticia no es una alerta. */
  deNoticia(noticiaId: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.url}/${noticiaId}`).pipe(conErrorApi());
  }

  resolver(noticiaId: number): Observable<Alerta> {
    return this.http
      .put<Alerta>(`${this.url}/${noticiaId}/${SUFIJOS.resuelta}`, null)
      .pipe(conErrorApi());
  }
}
