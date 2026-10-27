package com.aldia.dominio.excepcion;

public class AccionNoPermitidaExcepcion extends RuntimeException {

    public AccionNoPermitidaExcepcion(String mensaje) {
        super(mensaje);
    }
}
