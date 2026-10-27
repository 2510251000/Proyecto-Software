package com.aldia.dominio.excepcion;

public class DatosInvalidosExcepcion extends RuntimeException {

    public DatosInvalidosExcepcion(String mensaje) {
        super(mensaje);
    }
}
