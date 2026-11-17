package com.aldia.dominio.modelo;

import java.math.BigDecimal;

/**
 * Datos que escribe el autor al publicar. El resto (autor, fecha, oficial, estado)
 * lo decide el caso de uso. {@code alerta} es null en una noticia normal.
 */
public record NuevaNoticia(
        String titulo,
        String resumen,
        String contenido,
        Long ciudadId,
        BigDecimal latitud,
        BigDecimal longitud,
        String idLugarGoogle,
        TipoAlerta alerta
) {

    /** Una noticia normal, sin alerta. */
    public NuevaNoticia(String titulo, String resumen, String contenido, Long ciudadId,
                        BigDecimal latitud, BigDecimal longitud, String idLugarGoogle) {
        this(titulo, resumen, contenido, ciudadId, latitud, longitud, idLugarGoogle, null);
    }

    public boolean esAlerta() {
        return alerta != null;
    }
}
