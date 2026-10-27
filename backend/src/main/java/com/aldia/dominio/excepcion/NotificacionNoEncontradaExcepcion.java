package com.aldia.dominio.excepcion;

public class NotificacionNoEncontradaExcepcion extends RuntimeException {

    public NotificacionNoEncontradaExcepcion() {
        super("La notificación no existe");
    }
}
