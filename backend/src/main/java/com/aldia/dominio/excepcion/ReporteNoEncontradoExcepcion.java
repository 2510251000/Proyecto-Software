package com.aldia.dominio.excepcion;

public class ReporteNoEncontradoExcepcion extends RuntimeException {

    public ReporteNoEncontradoExcepcion() {
        super("El reporte no existe");
    }
}
