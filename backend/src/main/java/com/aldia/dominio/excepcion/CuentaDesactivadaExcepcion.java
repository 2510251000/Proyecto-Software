package com.aldia.dominio.excepcion;

public class CuentaDesactivadaExcepcion extends RuntimeException {

    public CuentaDesactivadaExcepcion() {
        super("La cuenta está desactivada");
    }
}
