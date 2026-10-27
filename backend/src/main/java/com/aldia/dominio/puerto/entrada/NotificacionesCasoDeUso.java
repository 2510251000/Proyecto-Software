package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.Notificacion;

public interface NotificacionesCasoDeUso {

    List<Notificacion> listar(String correo);

    long contarNoLeidas(String correo);

    void marcarLeida(String correo, Long notificacionId);

    void marcarTodasLeidas(String correo);
}
