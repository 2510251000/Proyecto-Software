package com.aldia.dominio.excepcion;

public class ServicioUbicacionNoDisponibleExcepcion extends RuntimeException {

    public ServicioUbicacionNoDisponibleExcepcion(Throwable causa) {
        super("El servicio de ubicación no respondió. Inténtalo de nuevo en unos segundos", causa);
    }
}
