package com.aldia.dominio.excepcion;

public class ComentarioNoEncontradoExcepcion extends RuntimeException {

    public ComentarioNoEncontradoExcepcion() {
        super("El comentario no existe");
    }
}
