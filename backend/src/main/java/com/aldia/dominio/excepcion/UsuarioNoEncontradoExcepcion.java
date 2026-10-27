package com.aldia.dominio.excepcion;

public class UsuarioNoEncontradoExcepcion extends RuntimeException {

    public UsuarioNoEncontradoExcepcion() {
        super("El usuario de la sesión no existe");
    }
}
