package com.aldia.dominio.puerto.salida;

import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;

/**
 * Lee las fotos sin depender de una librería concreta. Si el archivo no se puede leer como
 * el formato indicado, lanza ImagenInvalidaExcepcion.
 */
public interface ProcesadorImagenesPuerto {

    /** Ancho y alto, leídos de la cabecera sin decodificar toda la imagen. */
    DimensionesImagen medir(byte[] contenido, FormatoImagen formato);

    /** La misma foto sin metadatos (EXIF con la ubicación GPS, XMP, comentarios…). */
    byte[] limpiar(byte[] contenido, FormatoImagen formato);
}
