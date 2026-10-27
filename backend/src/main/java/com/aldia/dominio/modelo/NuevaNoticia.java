package com.aldia.dominio.modelo;

import java.math.BigDecimal;

/**
 * Datos que escribe el autor al publicar. El resto (autor, fecha, oficial, estado)
 * lo decide el caso de uso.
 */
public record NuevaNoticia(
        String titulo,
        String resumen,
        String contenido,
        Long ciudadId,
        BigDecimal latitud,
        BigDecimal longitud,
        String idLugarGoogle
) {
}
