package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

/**
 * Una alerta de emergencia con lo que hace falta para avisarla. Los detalles completos
 * (contenido, fotos, mapa) están en la noticia {@code noticiaId}.
 */
public record Alerta(
        Long noticiaId,
        TipoAlerta tipo,
        String titulo,
        String resumen,
        String ciudad,
        Long ciudadId,
        Long autorId,
        LocalDateTime fecha,
        boolean activa,
        LocalDateTime fechaResuelta
) {

    /** Sigue sonando si nadie la ha resuelto y no ha pasado la vigencia. */
    public boolean vigente(LocalDateTime ahora, int horasVigencia) {
        return activa && !fecha.isBefore(ahora.minusHours(horasVigencia));
    }

    /** La alerta junto con la notificación del usuario que todavía no la ha visto. */
    public record Pendiente(Long notificacionId, Alerta alerta) {
    }
}
