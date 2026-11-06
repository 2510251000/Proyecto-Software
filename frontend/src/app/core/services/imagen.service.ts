import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { CALIDAD_JPEG, LADO_MAXIMO_PX, TIPO_SALIDA } from '../constants/imagenes.constants';
import { conErrorApi } from './error-http';

/**
 * Fotos en el navegador: reducirlas antes de subirlas y traer las que necesitan sesión.
 */
@Injectable({ providedIn: 'root' })
export class ImagenService {
  // HttpClient se pide solo cuando hace falta: la miniatura usa este servicio en todas las
  // tarjetas y casi nunca necesita la red.
  private readonly inyector = inject(Injector);

  /**
   * Reduce la foto a LADO_MAXIMO_PX de lado y la exporta como JPEG. Respeta la rotación que
   * el celular guardó en el EXIF y, al volver a dibujarla, el EXIF (con la ubicación) desaparece.
   * Falla si el navegador no puede leer el archivo (algunas fotos HEIC de iPhone).
   */
  async reducir(archivo: Blob): Promise<Blob> {
    const mapa = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    try {
      const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(mapa.width, mapa.height));
      const ancho = Math.max(1, Math.round(mapa.width * escala));
      const alto = Math.max(1, Math.round(mapa.height * escala));
      const lienzo = document.createElement('canvas');
      lienzo.width = ancho;
      lienzo.height = alto;
      const contexto = lienzo.getContext('2d');
      if (contexto === null) {
        throw new Error('El navegador no permite dibujar la foto');
      }
      // Fondo blanco: un PNG con transparencia no queda negro al pasar a JPEG.
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, ancho, alto);
      contexto.drawImage(mapa, 0, 0, ancho, alto);
      return await new Promise<Blob>((resolver, rechazar) =>
        lienzo.toBlob(
          (blob) => (blob ? resolver(blob) : rechazar(new Error('No se pudo exportar la foto'))),
          TIPO_SALIDA,
          CALIDAD_JPEG,
        ),
      );
    } finally {
      mapa.close();
    }
  }

  /**
   * Una foto que el backend solo entrega con sesión (noticias ocultas, en la moderación).
   * Pasa por HttpClient para que el interceptor agregue el token.
   */
  obtenerProtegida(url: string): Observable<Blob> {
    return this.inyector.get(HttpClient).get(url, { responseType: 'blob' }).pipe(conErrorApi());
  }
}
