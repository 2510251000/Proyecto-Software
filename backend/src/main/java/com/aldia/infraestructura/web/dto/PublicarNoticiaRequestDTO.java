package com.aldia.infraestructura.web.dto;

import java.math.BigDecimal;

import com.aldia.dominio.modelo.NuevaNoticia;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PublicarNoticiaRequestDTO(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 200, message = "El título no puede tener más de 200 caracteres")
        String titulo,

        @Size(max = 500, message = "El resumen no puede tener más de 500 caracteres")
        String resumen,

        @NotBlank(message = "El contenido es obligatorio")
        String contenido,

        @NotNull(message = "La ciudad es obligatoria")
        Long ciudadId,

        @DecimalMin(value = "-90", message = "La latitud debe estar entre -90 y 90")
        @DecimalMax(value = "90", message = "La latitud debe estar entre -90 y 90")
        BigDecimal latitud,

        @DecimalMin(value = "-180", message = "La longitud debe estar entre -180 y 180")
        @DecimalMax(value = "180", message = "La longitud debe estar entre -180 y 180")
        BigDecimal longitud,

        @Size(max = 255, message = "El id del lugar no puede tener más de 255 caracteres")
        String idLugarGoogle
) {

    public NuevaNoticia aDominio() {
        return new NuevaNoticia(titulo, resumen, contenido, ciudadId, latitud, longitud, idLugarGoogle);
    }
}
