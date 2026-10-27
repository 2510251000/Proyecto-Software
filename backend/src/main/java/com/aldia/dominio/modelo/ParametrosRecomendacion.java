package com.aldia.dominio.modelo;

/**
 * Ventaja, en horas, que da el orden de recomendadas: por cada nivel del autor por
 * encima del 1 y por ser noticia oficial.
 */
public record ParametrosRecomendacion(int horasVentajaPorNivel, int horasVentajaOficial) {
}
