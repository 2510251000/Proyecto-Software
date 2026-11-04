package com.aldia.dominio.excepcion;

/** Una foto que no se puede aceptar: tipo, tamaño, cantidad o dimensiones. Responde 400. */
public class ImagenInvalidaExcepcion extends DatosInvalidosExcepcion {

    public ImagenInvalidaExcepcion(String mensaje) {
        super(mensaje);
    }
}
