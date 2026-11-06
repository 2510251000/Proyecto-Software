package com.aldia.dominio.modelo;

import java.util.Arrays;
import java.util.Objects;

/** Bytes de una foto para entregarla, con su formato y si la noticia es pública. */
public record ArchivoImagen(byte[] contenido, FormatoImagen formato, boolean publica) {

    /** Compara los bytes de la foto, no la referencia del arreglo. */
    @Override
    public boolean equals(Object otro) {
        return otro instanceof ArchivoImagen o
                && publica == o.publica
                && formato == o.formato
                && Arrays.equals(contenido, o.contenido);
    }

    @Override
    public int hashCode() {
        return 31 * Objects.hash(formato, publica) + Arrays.hashCode(contenido);
    }

    /** Muestra el tamaño y no los bytes, para no llenar los logs. */
    @Override
    public String toString() {
        return "ArchivoImagen[contenido=" + (contenido == null ? 0 : contenido.length)
                + " bytes, formato=" + formato + ", publica=" + publica + "]";
    }
}
