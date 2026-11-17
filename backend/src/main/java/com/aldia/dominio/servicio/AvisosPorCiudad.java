package com.aldia.dominio.servicio;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import com.aldia.dominio.modelo.Alerta;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoAlerta;
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
        return avisar(noticia, usuariosDeLaCiudad, TipoNotificacion.CERCANIA, mensaje, ahora);
    }

    /**
     * Una alerta de emergencia: el mismo reparto por ciudad, pero con el tipo ALERTA, que la
     * aplicación muestra a pantalla completa con sonido y vibración.
     */
    public List<Notificacion> paraAlerta(Noticia noticia, TipoAlerta tipo, Collection<Long> usuariosDeLaCiudad,
                                         LocalDateTime ahora) {
        String mensaje = recortar("ALERTA · " + tipo.getNombre() + " en " + noticia.getCiudad() + ": "
                + noticia.getTitulo());
        return avisar(noticia, usuariosDeLaCiudad, TipoNotificacion.ALERTA, mensaje, ahora);
    }

    /** Cuando el autor o un administrador da la alerta por terminada (por ejemplo, la persona apareció). */
    public List<Notificacion> paraAlertaResuelta(Alerta alerta, Collection<Long> usuariosDeLaCiudad,
                                                 LocalDateTime ahora) {
        String mensaje = recortar("Alerta resuelta en " + alerta.ciudad() + ": " + alerta.titulo());
        return avisar(alerta.noticiaId(), alerta.autorId(), usuariosDeLaCiudad, TipoNotificacion.CERCANIA,
                mensaje, ahora);
    }

    private static List<Notificacion> avisar(Noticia noticia, Collection<Long> usuariosDeLaCiudad,
                                             TipoNotificacion tipo, String mensaje, LocalDateTime ahora) {
        return avisar(noticia.getId(), noticia.getAutorId(), usuariosDeLaCiudad, tipo, mensaje, ahora);
    }

    private static List<Notificacion> avisar(Long noticiaId, Long autorId, Collection<Long> usuariosDeLaCiudad,
                                             TipoNotificacion tipo, String mensaje, LocalDateTime ahora) {
        return usuariosDeLaCiudad.stream()
                .filter(Objects::nonNull)
                .distinct()
                .filter(usuarioId -> !usuarioId.equals(autorId))
                .map(usuarioId -> Notificacion.nueva(usuarioId, tipo, mensaje, noticiaId, ahora))
                .toList();
    }

    public static String recortar(String mensaje) {
        return mensaje.length() <= LARGO_MAXIMO_MENSAJE
                ? mensaje
                : mensaje.substring(0, LARGO_MAXIMO_MENSAJE - 1) + "…";
    }
}
