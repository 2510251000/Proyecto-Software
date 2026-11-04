package com.aldia.infraestructura.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
        Long autorId,
        String autor,
        int autorNivel,
        String estado,
        BigDecimal latitud,
        BigDecimal longitud,
        List<ImagenResponseDTO> imagenes,
        double promedio,
        long cantidadCalificaciones,
        /** Lo que le dio el usuario de la sesión; null sin sesión o si no ha calificado. */
        Integer miCalificacion
) {
    public static NoticiaResponseDTO desde(Noticia noticia) {
        return desde(noticia, null);
    }

    public static NoticiaResponseDTO desde(Noticia noticia, Integer miCalificacion) {
        return new NoticiaResponseDTO(
                noticia.getId(),
                noticia.getTitulo(),
                noticia.getResumen(),
                noticia.getContenido(),
                noticia.getFechaPublicacion(),
                noticia.isOficial(),
                noticia.getCiudad(),
                noticia.getCiudadId(),
                noticia.getAutorId(),
                noticia.getAutorNombre(),
                noticia.getAutorNivel(),
                noticia.getEstado() != null ? noticia.getEstado().name() : null,
                noticia.getLatitud(),
                noticia.getLongitud(),
                noticia.getImagenes().stream().map(i -> ImagenResponseDTO.desde(noticia.getId(), i)).toList(),
                noticia.getCalificaciones().promedio(),
                noticia.getCalificaciones().cantidad(),
                miCalificacion
        );
    }
}
