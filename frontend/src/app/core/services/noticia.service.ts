import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { Noticia } from '../models/noticia.model';
import { aErrorApi } from './error-http';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Noticia[]> {
    return this.http
      .get<Noticia[]>(`${environment.apiUrl}${ENDPOINTS.noticias}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => aErrorApi(error))));
  }
}
