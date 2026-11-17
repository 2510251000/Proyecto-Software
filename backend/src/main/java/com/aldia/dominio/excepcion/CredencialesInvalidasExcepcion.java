package com.aldia.dominio.excepcion;

public class CredencialesInvalidasExcepcion extends RuntimeException {

    public CredencialesInvalidasExcepcion() {
        super("El correo o la contraseña son incorrectos");
    }

    public CredencialesInvalidasExcepcion(String mensaje) {
        super(mensaje);
    }
}