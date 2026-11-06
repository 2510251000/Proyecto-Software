package com.aldia.dominio.modelo;

import java.util.Arrays;
import java.util.Objects;

/** Foto ya validada y limpia (sin metadatos), lista para guardarse. */
public record ImagenProcesada(byte[] contenido, FormatoImagen formato) {

    /** Compara los bytes de la foto, no la referencia del arreglo. */
    @Override
    public boolean equals(Object otro) {
        return otro instanceof ImagenProcesada o
                && formato == o.formato
                && Arrays.equals(contenido, o.contenido);
    }

    @Override
    public int hashCode() {
        return 31 * Objects.hashCode(formato) + Arrays.hashCode(contenido);
    }

    /** Muestra el tamaño y no los bytes, para no llenar los logs. */
    @Override
    public String toString() {
        return "ImagenProcesada[contenido=" + (contenido == null ? 0 : contenido.length)
                + " bytes, formato=" + formato + "]";
    }
}
