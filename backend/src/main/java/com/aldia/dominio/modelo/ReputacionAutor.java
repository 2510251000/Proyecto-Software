package com.aldia.dominio.modelo;

/**
 * Lo que opinan los lectores de un autor: cuántos votos recibió en todas sus noticias y
 * cuántos fueron «sigue publicando así». La aprobación es el porcentaje redondeado.
 */
public record ReputacionAutor(long positivos, long votos) {

    public static final ReputacionAutor SIN_VOTOS = new ReputacionAutor(0, 0);

    /** Porcentaje de votos positivos (0 a 100), o null si nadie ha votado todavía. */
    public Integer aprobacion() {
        return votos == 0 ? null : (int) Math.round(positivos * 100.0 / votos);
    }
}
