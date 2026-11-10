import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ENDPOINTS, PARAMETROS_NOTICIAS } from '../constants/endpoints.constants';
import { EXTENSION_SALIDA, PARTES_PUBLICAR } from '../constants/imagenes.constants';
import { FotoSeleccionada, ProgresoPublicacion } from '../models/imagen.model';
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

  /**
   * Publica con fotos (multipart): la parte «datos» lleva el mismo JSON y cada foto va en una
   * parte «imagenes», en orden. Va avisando el porcentaje subido y al final entrega la noticia.
   */
  publicarConImagenes(datos: NuevaNoticia, fotos: readonly FotoSeleccionada[]): Observable<ProgresoPublicacion> {
    const formulario = new FormData();
    const conDescripciones: NuevaNoticia = { ...datos, descripcionesImagenes: fotos.map((f) => f.descripcion.trim()) };
    formulario.append(
      PARTES_PUBLICAR.datos,
      new Blob([JSON.stringify(conDescripciones)], { type: 'application/json' }),
    );
    fotos.forEach((foto, posicion) =>
      formulario.append(PARTES_PUBLICAR.imagenes, foto.archivo, nombreJpeg(foto.nombre, posicion)),
    );
    return this.http
      .post<Noticia>(this.url, formulario, { reportProgress: true, observe: 'events' })
      .pipe(
        map((evento): ProgresoPublicacion | null => {
          if (evento.type === HttpEventType.UploadProgress) {
            const total = evento.total ?? 0;
            return { tipo: 'progreso', porcentaje: total > 0 ? Math.round((evento.loaded / total) * 100) : 0 };
          }
          if (evento.type === HttpEventType.Response && evento.body !== null) {
            return { tipo: 'listo', noticia: evento.body };
          }
          return null;
        }),
        filter((progreso): progreso is ProgresoPublicacion => progreso !== null),
        conErrorApi(),
      );
  }
}

/** La foto ya es JPEG: el nombre lo dice, sin la extensión que traía (que podía ser .heic o .png). */
function nombreJpeg(nombre: string, posicion: number): string {
  const base = nombre.replace(/\.[^.]+$/, '').trim() || `foto-${posicion + 1}`;
  return `${base}${EXTENSION_SALIDA}`;
}
