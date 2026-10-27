import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../constants/endpoints.constants';
import { CambiosPerfil, Perfil } from '../models/perfil.model';
import { conErrorApi } from './error-http';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}${ENDPOINTS.usuarioActual}`;

  /** Datos del usuario de la sesión, con su nivel y el cupo de publicaciones de hoy. */
  obtener(): Observable<Perfil> {
    return this.http.get<Perfil>(this.url).pipe(conErrorApi());
  }

  actualizar(cambios: CambiosPerfil): Observable<Perfil> {
    return this.http.put<Perfil>(this.url, cambios).pipe(conErrorApi());
  }
}
