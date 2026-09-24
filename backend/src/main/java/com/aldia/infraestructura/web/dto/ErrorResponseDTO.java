package com.aldia.infraestructura.web.dto;

public class ErrorResponseDTO {

    private int estado;
    private String mensaje;

    public ErrorResponseDTO(int estado, String mensaje) {
        this.estado = estado;
        this.mensaje = mensaje;
    }

    public int getEstado() {
        return estado;
    }

    public String getMensaje() {
        return mensaje;
    }
}
