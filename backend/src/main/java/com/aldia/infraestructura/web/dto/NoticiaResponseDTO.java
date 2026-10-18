package com.aldia.infraestructura.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Noticia;

public record NoticiaResponseDTO(
        Long id,
        String titulo,
        String resumen,
        String contenido,
        LocalDateTime fechaPublicacion,
        boolean oficial,
        String ciudad,
        Long ciudadId,
        String autor,
        int autorNivel,
        String estado,
        BigDecimal latitud,
        BigDecimal longitud
) {
    public static NoticiaResponseDTO desde(Noticia noticia) {
        return new NoticiaResponseDTO(
                noticia.getId(),
                noticia.getTitulo(),
                noticia.getResumen(),
                noticia.getContenido(),
                noticia.getFechaPublicacion(),
                noticia.isOficial(),
                noticia.getCiudad(),
                noticia.getCiudadId(),
                noticia.getAutorNombre(),
                noticia.getAutorNivel(),
                noticia.getEstado() != null ? noticia.getEstado().name() : null,
                noticia.getLatitud(),
                noticia.getLongitud()
        );
    }
}
