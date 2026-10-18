import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, PARAMETROS_NOTICIAS, SUFIJOS } from '../constants/endpoints.constants';
import { CambiosUsuario, UsuarioAdmin } from '../models/admin.model';
import { EstadoNoticia, Noticia, TipoNoticias } from '../models/noticia.model';
import { conErrorApi } from './error-http';

/** Panel de administración. El backend exige el rol ADMINISTRADOR en todas estas rutas. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly urlNoticias = `${environment.apiUrl}${ENDPOINTS.adminNoticias}`;
  private readonly urlUsuarios = `${environment.apiUrl}${ENDPOINTS.adminUsuarios}`;

  noticias(estado?: EstadoNoticia, tipo?: TipoNoticias): Observable<Noticia[]> {
    let params = new HttpParams();
    if (estado !== undefined) {
      params = params.set(PARAMETROS_NOTICIAS.estado, estado);
    }
    if (tipo !== undefined) {
      params = params.set(PARAMETROS_NOTICIAS.tipo, tipo);
    }
    return this.http.get<Noticia[]>(this.urlNoticias, { params }).pipe(conErrorApi());
  }

  cambiarEstado(id: number, estado: EstadoNoticia): Observable<Noticia> {
    return this.http
      .put<Noticia>(`${this.urlNoticias}/${id}/${SUFIJOS.estado}`, { estado })
      .pipe(conErrorApi());
  }

  borrar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlNoticias}/${id}`).pipe(conErrorApi());
  }

  usuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.urlUsuarios).pipe(conErrorApi());
  }

  actualizarUsuario(id: number, cambios: CambiosUsuario): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.urlUsuarios}/${id}`, cambios).pipe(conErrorApi());
  }
}
