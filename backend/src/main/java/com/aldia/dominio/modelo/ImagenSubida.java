package com.aldia.dominio.modelo;

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
}
