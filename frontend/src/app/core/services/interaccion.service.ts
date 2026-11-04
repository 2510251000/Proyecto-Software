import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, SUFIJOS } from '../constants/endpoints.constants';
import { Comentario, NuevoReporte, Reporte, ResultadoCalificacion } from '../models/interaccion.model';
import { conErrorApi } from './error-http';

/** Comentarios, calificaciones y reportes de una noticia. */
@Injectable({ providedIn: 'root' })
export class InteraccionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}${ENDPOINTS.noticias}`;

  comentarios(noticiaId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.url}/${noticiaId}/${SUFIJOS.comentarios}`).pipe(conErrorApi());
  }

  comentar(noticiaId: number, contenido: string): Observable<Comentario> {
    return this.http
      .post<Comentario>(`${this.url}/${noticiaId}/${SUFIJOS.comentarios}`, { contenido })
      .pipe(conErrorApi());
  }

  borrarComentario(noticiaId: number, comentarioId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${noticiaId}/${SUFIJOS.comentarios}/${comentarioId}`)
      .pipe(conErrorApi());
  }

  calificar(noticiaId: number, valor: number): Observable<ResultadoCalificacion> {
    return this.http
      .put<ResultadoCalificacion>(`${this.url}/${noticiaId}/${SUFIJOS.calificacion}`, { valor })
      .pipe(conErrorApi());
  }

  reportar(noticiaId: number, reporte: NuevoReporte): Observable<Reporte> {
    return this.http.post<Reporte>(`${this.url}/${noticiaId}/${SUFIJOS.reportes}`, reporte).pipe(conErrorApi());
  }
}
