package com.aldia.dominio.excepcion;

public class CiudadNoEncontradaExcepcion extends RuntimeException {

    public CiudadNoEncontradaExcepcion() {
        super("La ciudad indicada no existe");
    }
}
