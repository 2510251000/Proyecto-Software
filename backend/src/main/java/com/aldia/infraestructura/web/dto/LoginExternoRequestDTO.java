package com.aldia.infraestructura.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** El token de identidad que Firebase Authentication entrega al frontend tras entrar con Google. */
public record LoginExternoRequestDTO(
        @NotBlank(message = "Falta el token de Google")
        @Size(max = 4096, message = "El token de Google no es válido")
        String token
) {
}
