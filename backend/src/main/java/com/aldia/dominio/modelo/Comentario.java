package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

/** Opinión de un usuario sobre una noticia. El nombre y el nivel del autor son para mostrarlo. */
public record Comentario(Long id, Long noticiaId, Long usuarioId, String autorNombre, int autorNivel,
                         String contenido, LocalDateTime fecha) {
}
