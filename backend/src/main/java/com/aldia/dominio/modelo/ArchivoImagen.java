package com.aldia.dominio.modelo;

/** Bytes de una foto para entregarla, con su formato y si la noticia es pública. */
public record ArchivoImagen(byte[] contenido, FormatoImagen formato, boolean publica) {
}
