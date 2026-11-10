package com.aldia.dominio.modelo;

/**
 * Foto de una noticia. La clave es donde la guardó el almacén (no es una URL pública);
 * la API la sirve en /api/noticias/{id}/imagenes/{orden}. El orden 1 es la portada.
 */
public record ImagenNoticia(int orden, String clave, String textoAlternativo) {

    public FormatoImagen formato() {
        int punto = clave.lastIndexOf('.');
        return FormatoImagen.desdeExtension(punto >= 0 ? clave.substring(punto + 1) : "");
    }
}
