package com.aldia.dominio.modelo;

import java.math.BigDecimal;

/**
 * Municipio del catálogo. Las coordenadas y el id del lugar llegan de la API de
 * geocodificación cuando la ciudad se registró desde allí; las del catálogo inicial no los tienen.
 */
public record Ciudad(
        Long id,
        String nombre,
        String departamento,
        BigDecimal latitud,
        BigDecimal longitud,
        String idLugar
) {
}
