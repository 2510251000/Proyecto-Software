package com.aldia.dominio.excepcion;

public class InicioExternoNoDisponibleExcepcion extends RuntimeException {

    public InicioExternoNoDisponibleExcepcion() {
        super("El inicio de sesión con Google no está disponible en este servidor");
    }
}
