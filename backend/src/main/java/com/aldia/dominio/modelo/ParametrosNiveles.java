package com.aldia.dominio.modelo;

/**
 * Regla para subir de nivel (configurable en application.yml): puntos que suma cada
 * noticia publicada y puntos que resta cada noticia que el administrador oculta o borra.
 */
public record ParametrosNiveles(int puntosPorPublicacion, int puntosPenalizacionModeracion) {
}
