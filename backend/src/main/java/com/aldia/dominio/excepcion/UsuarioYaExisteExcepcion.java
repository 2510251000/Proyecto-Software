package com.aldia.dominio.excepcion;

public class UsuarioYaExisteExcepcion extends RuntimeException {

    public UsuarioYaExisteExcepcion(String correo) {
        super("Ya existe un usuario registrado con el correo: " + correo);
    }
}