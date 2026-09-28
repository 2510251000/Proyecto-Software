package com.aldia.dominio.excepcion;

public class LimiteDiarioAlcanzadoExcepcion extends RuntimeException {

    public LimiteDiarioAlcanzadoExcepcion(int limite, String nivel) {
        super(String.format("Alcanzaste el límite de %d %s por día de tu nivel %s",
                limite, limite == 1 ? "noticia" : "noticias", nivel));
    }
}
