import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, PARAMETROS_NOTICIAS } from '../constants/endpoints.constants';
import {
  Ciudad,
  CiudadResuelta,
  Coordenadas,
  LugarEncontrado,
} from '../models/ubicacion.model';
import { conErrorApi } from './error-http';

/**
 * Ubicación con la API de mapas del backend (Google Maps o Nominatim). El navegador nunca
 * llama a la API de mapas directamente: así la clave de Google no sale del servidor.
 */
@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly http = inject(HttpClient);

  ciudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${environment.apiUrl}${ENDPOINTS.ciudades}`).pipe(conErrorApi());
  }

  buscar(texto: string): Observable<LugarEncontrado[]> {
    const params = new HttpParams().set(PARAMETROS_NOTICIAS.texto, texto.trim());
    return this.http
      .get<LugarEncontrado[]>(`${environment.apiUrl}${ENDPOINTS.buscarUbicacion}`, { params })
      .pipe(conErrorApi());
  }

  resolverCoordenadas(coordenadas: Coordenadas): Observable<CiudadResuelta> {
    return this.http
      .post<CiudadResuelta>(`${environment.apiUrl}${ENDPOINTS.resolverUbicacion}`, coordenadas)
      .pipe(conErrorApi());
  }

  resolverLugar(idLugar: string): Observable<CiudadResuelta> {
    return this.http
      .post<CiudadResuelta>(`${environment.apiUrl}${ENDPOINTS.resolverUbicacion}`, { idLugar })
      .pipe(conErrorApi());
  }
}
