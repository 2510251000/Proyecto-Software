package com.aldia.dominio.modelo;

/**
 * Acciones que acepta hoy la tabla historial (CHECK ck_historial_accion).
 */
public enum AccionHistorial {
    REGISTRO,
    INICIO_SESION,
    PUBLICACION,
    COMENTARIO,
    CALIFICACION,
    REPORTE
}
