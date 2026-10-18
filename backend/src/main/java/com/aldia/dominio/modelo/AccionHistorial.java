package com.aldia.dominio.modelo;

/**
 * Acciones que acepta la tabla historial (CHECK ck_historial_accion, ampliado en V3).
 */
public enum AccionHistorial {
    REGISTRO,
    INICIO_SESION,
    PUBLICACION,
    COMENTARIO,
    CALIFICACION,
    REPORTE,
    MODERACION,
    CAMBIO_NIVEL
}
