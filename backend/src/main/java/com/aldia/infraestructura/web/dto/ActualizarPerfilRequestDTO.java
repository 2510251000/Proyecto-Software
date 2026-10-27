package com.aldia.infraestructura.web.dto;

import jakarta.validation.constraints.Size;

/** Los campos en null no se cambian. */
public record ActualizarPerfilRequestDTO(
        @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
        String nombre,
        Long ciudadId
) {
}
