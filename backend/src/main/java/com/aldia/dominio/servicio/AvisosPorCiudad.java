package com.aldia.dominio.servicio;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;

/**
 * Cuando se publica una noticia, avisa a los usuarios de la misma ciudad (menos al autor).
 */
public class AvisosPorCiudad {

    /** Largo máximo de notificacion.mensaje en la base. */
    public static final int LARGO_MAXIMO_MENSAJE = 300;

    public List<Notificacion> paraNoticiaNueva(Noticia noticia, Collection<Long> usuariosDeLaCiudad,
                                               LocalDateTime ahora) {
        String mensaje = recortar("Nueva noticia en " + noticia.getCiudad() + ": " + noticia.getTitulo());
        return usuariosDeLaCiudad.stream()
                .filter(Objects::nonNull)
                .distinct()
                .filter(usuarioId -> !usuarioId.equals(noticia.getAutorId()))
                .map(usuarioId -> Notificacion.nueva(usuarioId, TipoNotificacion.CERCANIA, mensaje,
                        noticia.getId(), ahora))
                .toList();
    }

    public static String recortar(String mensaje) {
        return mensaje.length() <= LARGO_MAXIMO_MENSAJE
                ? mensaje
                : mensaje.substring(0, LARGO_MAXIMO_MENSAJE - 1) + "…";
    }
}
