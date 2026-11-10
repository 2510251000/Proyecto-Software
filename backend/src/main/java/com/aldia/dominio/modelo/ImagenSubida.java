package com.aldia.dominio.modelo;

import java.util.Arrays;
import java.util.Objects;

/**
 * Una foto tal como llega al publicar, antes de validarla. El nombre del archivo solo
 * sirve para los mensajes de error: el tipo real se decide por los bytes.
 */
public record ImagenSubida(String nombreArchivo, byte[] contenido, String textoAlternativo) {

    public ImagenSubida {
        contenido = contenido == null ? new byte[0] : contenido;
    }

    public long tamano() {
        return contenido.length;
    }

    /** Compara los bytes de la foto, no la referencia del arreglo. */
    @Override
    public boolean equals(Object otro) {
        return otro instanceof ImagenSubida o
                && Objects.equals(nombreArchivo, o.nombreArchivo)
                && Objects.equals(textoAlternativo, o.textoAlternativo)
                && Arrays.equals(contenido, o.contenido);
    }

    @Override
    public int hashCode() {
        return 31 * Objects.hash(nombreArchivo, textoAlternativo) + Arrays.hashCode(contenido);
    }

    /** Muestra el tamaño y no los bytes, para no llenar los logs. */
    @Override
    public String toString() {
        return "ImagenSubida[nombreArchivo=" + nombreArchivo + ", contenido=" + contenido.length
                + " bytes, textoAlternativo=" + textoAlternativo + "]";
    }
}
