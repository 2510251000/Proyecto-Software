package com.aldia.infraestructura.web.dto;

import java.math.BigDecimal;

import com.aldia.dominio.modelo.UbicacionEncontrada;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

/**
 * DTOs de /api/ubicacion.
 */
public final class UbicacionDTOs {

    private UbicacionDTOs() {
    }

    /** Un resultado de búsqueda de la API externa. Se elige uno y se manda su idLugar a /resolver. */
    public record LugarDTO(String idLugar, String ciudad, String departamento, String descripcion,
                           BigDecimal latitud, BigDecimal longitud, String proveedor) {

        public static LugarDTO desde(UbicacionEncontrada ubicacion) {
            return new LugarDTO(ubicacion.idLugar(), ubicacion.ciudad(), ubicacion.departamento(),
                    ubicacion.descripcion(), ubicacion.latitud(), ubicacion.longitud(), ubicacion.proveedor());
        }
    }

    /** Se manda idLugar (de una búsqueda) o latitud y longitud (del GPS del navegador). */
    public record ResolverUbicacionDTO(
            @Size(max = 255, message = "El id del lugar es demasiado largo")
            String idLugar,

            @DecimalMin(value = "-90", message = "La latitud debe estar entre -90 y 90")
            @DecimalMax(value = "90", message = "La latitud debe estar entre -90 y 90")
            BigDecimal latitud,

            @DecimalMin(value = "-180", message = "La longitud debe estar entre -180 y 180")
            @DecimalMax(value = "180", message = "La longitud debe estar entre -180 y 180")
            BigDecimal longitud
    ) {
    }

    /** La ciudad ya registrada en el catálogo, con el proveedor que la resolvió. */
    public record CiudadResueltaDTO(Long id, String nombre, String departamento, BigDecimal latitud,
                                    BigDecimal longitud, String proveedor) {
    }
}
