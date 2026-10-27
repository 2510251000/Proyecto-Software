import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, PARAMETROS_NOTICIAS } from '../constants/endpoints.constants';
import { CriteriosNoticias, Noticia, NuevaNoticia } from '../models/noticia.model';
import { conErrorApi } from './error-http';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}${ENDPOINTS.noticias}`;

  /** Noticias publicadas. Los criterios que no se pasan no se envían. */
  listar(criterios: CriteriosNoticias = {}): Observable<Noticia[]> {
    let params = new HttpParams();
    if (criterios.tipo !== undefined) {
      params = params.set(PARAMETROS_NOTICIAS.tipo, criterios.tipo);
    }
    if (criterios.ciudadId !== undefined) {
      params = params.set(PARAMETROS_NOTICIAS.ciudad, criterios.ciudadId);
    }
    const texto = criterios.texto?.trim();
    if (texto) {
      params = params.set(PARAMETROS_NOTICIAS.texto, texto);
    }
    if (criterios.orden !== undefined) {
      params = params.set(PARAMETROS_NOTICIAS.orden, criterios.orden);
    }
    return this.http.get<Noticia[]>(this.url, { params }).pipe(conErrorApi());
  }

  obtener(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.url}/${id}`).pipe(conErrorApi());
  }

  publicar(datos: NuevaNoticia): Observable<Noticia> {
    return this.http.post<Noticia>(this.url, datos).pipe(conErrorApi());
  }
}
