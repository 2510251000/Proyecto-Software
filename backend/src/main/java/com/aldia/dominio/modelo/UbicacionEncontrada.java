package com.aldia.dominio.modelo;

import java.math.BigDecimal;

/**
 * Lugar que devolvió la API de geocodificación (Google Maps o Nominatim), ya reducido
 * a lo que le importa al portal: el municipio, su departamento y el punto exacto.
 */
public record UbicacionEncontrada(
        String idLugar,
        String ciudad,
        String departamento,
        String descripcion,
        BigDecimal latitud,
        BigDecimal longitud,
        String proveedor
) {
}
