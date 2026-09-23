package com.aldia.infraestructura.web.dto;

public class ErrorResponseDTO {

    private String mensaje;

    public ErrorResponseDTO(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getMensaje() {
        return mensaje;
    }
}