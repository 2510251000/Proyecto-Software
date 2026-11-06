package com.aldia.dominio.modelo;

/** Promedio (con un decimal) y cantidad de calificaciones de una noticia. */
public record ResumenCalificaciones(double promedio, long cantidad) {

    public static final ResumenCalificaciones VACIO = new ResumenCalificaciones(0, 0);

    public ResumenCalificaciones {
        promedio = Math.round(promedio * 10) / 10.0;
    }
}
