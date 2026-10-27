package com.aldia.dominio.puerto.salida;

import java.util.List;

import com.aldia.dominio.modelo.Notificacion;

public interface NotificacionRepositorioPuerto {

    void guardarTodas(List<Notificacion> notificaciones);

    /** Las más recientes primero. */
    List<Notificacion> listarDelUsuario(Long usuarioId, int limite);

    long contarNoLeidas(Long usuarioId);

    /** false si la notificación no existe o es de otro usuario. */
    boolean marcarLeida(Long notificacionId, Long usuarioId);

    void marcarTodasLeidas(Long usuarioId);
}
