package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Noticia;

public record NoticiaResponseDTO(
        Long id,
        String titulo,
        String resumen,
        String contenido,
        LocalDateTime fechaPublicacion,
        boolean oficial,
        String ciudad
) {
    public static NoticiaResponseDTO desde(Noticia noticia) {
        return new NoticiaResponseDTO(
                noticia.getId(),
                noticia.getTitulo(),
                noticia.getResumen(),
                noticia.getContenido(),
                noticia.getFechaPublicacion(),
                noticia.isOficial(),
                noticia.getCiudad()
        );
    }
}