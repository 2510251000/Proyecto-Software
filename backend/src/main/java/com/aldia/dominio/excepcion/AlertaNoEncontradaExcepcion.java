package com.aldia.dominio.excepcion;

public class AlertaNoEncontradaExcepcion extends RuntimeException {

    public AlertaNoEncontradaExcepcion() {
        super("Esta noticia no tiene una alerta");
    }
}
