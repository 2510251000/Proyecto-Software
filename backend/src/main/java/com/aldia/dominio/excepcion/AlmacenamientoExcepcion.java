package com.aldia.dominio.excepcion;

/** No se pudo guardar, leer o borrar un archivo en el almacén de imágenes. */
public class AlmacenamientoExcepcion extends RuntimeException {

    public AlmacenamientoExcepcion(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
