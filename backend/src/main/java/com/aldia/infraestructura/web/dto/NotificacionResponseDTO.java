package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Notificacion;

public record NotificacionResponseDTO(Long id, String tipo, String mensaje, Long noticiaId, boolean leida,
                                      LocalDateTime fecha) {

    public static NotificacionResponseDTO desde(Notificacion notificacion) {
        return new NotificacionResponseDTO(notificacion.id(), notificacion.tipo().name(), notificacion.mensaje(),
                notificacion.noticiaId(), notificacion.leida(), notificacion.fecha());
    }

    public record ConteoDTO(long cantidad) {
    }
}
