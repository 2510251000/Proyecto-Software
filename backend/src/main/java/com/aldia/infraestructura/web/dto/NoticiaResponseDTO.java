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
        /** % de votos «sigue publicando así» que tiene el autor en todas sus noticias; null sin votos. */
        Integer autorAprobacion,
        long autorVotos,
        /** Lo que votó el usuario de la sesión en esta noticia; null sin sesión o si no ha votado. */
        Boolean miVoto
) {
    public static NoticiaResponseDTO desde(Noticia noticia) {
        return desde(noticia, null);
    }

    public static NoticiaResponseDTO desde(Noticia noticia, Boolean miVoto) {
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
                noticia.getReputacionAutor().aprobacion(),
                noticia.getReputacionAutor().votos(),
                miVoto
        );
    }
}
