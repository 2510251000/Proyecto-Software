package com.aldia.infraestructura.web.dto;

import com.aldia.dominio.modelo.ImagenNoticia;

/** Una foto de la noticia: la ruta de la API que la entrega, su orden (1 = portada) y su descripción. */
public record ImagenResponseDTO(String url, int orden, String textoAlternativo) {

    /** Ruta relativa a la API; el frontend le antepone la URL del backend. */
    public static ImagenResponseDTO desde(Long noticiaId, ImagenNoticia imagen) {
        return new ImagenResponseDTO("/api/noticias/" + noticiaId + "/imagenes/" + imagen.orden(), imagen.orden(),
                imagen.textoAlternativo());
    }
}
