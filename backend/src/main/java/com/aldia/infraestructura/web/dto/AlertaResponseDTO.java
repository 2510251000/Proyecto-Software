package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Alerta;

public record AlertaResponseDTO(
        Long noticiaId,
        String tipo,
        String titulo,
        String resumen,
        String ciudad,
        Long ciudadId,
        Long autorId,
        LocalDateTime fecha,
        boolean activa,
        LocalDateTime fechaResuelta
) {
    public static AlertaResponseDTO desde(Alerta alerta) {
        return new AlertaResponseDTO(alerta.noticiaId(), alerta.tipo().name(), alerta.titulo(), alerta.resumen(),
                alerta.ciudad(), alerta.ciudadId(), alerta.autorId(), alerta.fecha(), alerta.activa(),
                alerta.fechaResuelta());
    }

    /** Una alerta que el usuario no ha visto, con la notificación que hay que marcar como leída al cerrarla. */
    public record PendienteDTO(Long notificacionId, AlertaResponseDTO alerta) {
        public static PendienteDTO desde(Alerta.Pendiente pendiente) {
            return new PendienteDTO(pendiente.notificacionId(), AlertaResponseDTO.desde(pendiente.alerta()));
        }
    }
}
