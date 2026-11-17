package com.aldia.dominio.puerto.salida;

import java.util.List;

import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;

public interface NotificacionRepositorioPuerto {

    void guardarTodas(List<Notificacion> notificaciones);

    /** Las más recientes primero. */
    List<Notificacion> listarDelUsuario(Long usuarioId, int limite);

    long contarNoLeidas(Long usuarioId);

    /** Las no leídas de un tipo, las más recientes primero (para las alertas a pantalla completa). */
    List<Notificacion> listarNoLeidasDeTipo(Long usuarioId, TipoNotificacion tipo);

    /** false si la notificación no existe o es de otro usuario. */
    boolean marcarLeida(Long notificacionId, Long usuarioId);

    void marcarTodasLeidas(Long usuarioId);
}
