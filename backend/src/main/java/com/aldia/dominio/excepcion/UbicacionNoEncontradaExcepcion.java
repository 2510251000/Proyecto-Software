package com.aldia.dominio.excepcion;

public class UbicacionNoEncontradaExcepcion extends RuntimeException {

    public UbicacionNoEncontradaExcepcion() {
        super("No encontramos un municipio en esa ubicación");
    }
}
