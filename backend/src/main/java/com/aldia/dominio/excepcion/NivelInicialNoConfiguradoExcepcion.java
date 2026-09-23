package com.aldia.dominio.excepcion;

public class NivelInicialNoConfiguradoExcepcion extends RuntimeException {

    public NivelInicialNoConfiguradoExcepcion() {
        super("No hay niveles configurados en la base de datos");
    }
}
