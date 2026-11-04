package com.aldia.dominio.excepcion;

public class ImagenNoEncontradaExcepcion extends RuntimeException {

    public ImagenNoEncontradaExcepcion() {
        super("La imagen no existe");
    }
}
