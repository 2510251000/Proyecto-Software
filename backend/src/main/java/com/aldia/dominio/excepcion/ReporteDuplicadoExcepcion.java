package com.aldia.dominio.excepcion;

/** El usuario ya reportó esta noticia. Responde 409. */
public class ReporteDuplicadoExcepcion extends RuntimeException {

    public ReporteDuplicadoExcepcion() {
        super("Ya reportaste esta noticia. Un administrador la va a revisar");
    }
}
