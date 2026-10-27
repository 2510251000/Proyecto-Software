package com.aldia.infraestructura.web.dto;

import java.math.BigDecimal;

import com.aldia.dominio.modelo.Ciudad;

public record CiudadResponseDTO(Long id, String nombre, String departamento, BigDecimal latitud, BigDecimal longitud) {

    public static CiudadResponseDTO desde(Ciudad ciudad) {
        return ciudad == null ? null
                : new CiudadResponseDTO(ciudad.id(), ciudad.nombre(), ciudad.departamento(), ciudad.latitud(),
                ciudad.longitud());
    }
}
