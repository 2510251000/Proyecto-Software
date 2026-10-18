package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

/**
 * Aviso dentro de la aplicación para un usuario. noticiaId es null cuando el aviso
 * no apunta a una noticia (por ejemplo, un ascenso de nivel).
 */
public record Notificacion(
        Long id,
        Long usuarioId,
        TipoNotificacion tipo,
        String mensaje,
        Long noticiaId,
        boolean leida,
        LocalDateTime fecha
) {

    public static Notificacion nueva(Long usuarioId, TipoNotificacion tipo, String mensaje,
                                     Long noticiaId, LocalDateTime fecha) {
        return new Notificacion(null, usuarioId, tipo, mensaje, noticiaId, false, fecha);
    }
}
