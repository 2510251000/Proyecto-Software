package com.aldia.dominio.excepcion;

public class NoticiaNoEncontradaExcepcion extends RuntimeException {

    public NoticiaNoEncontradaExcepcion() {
        super("La noticia no existe");
    }
}
