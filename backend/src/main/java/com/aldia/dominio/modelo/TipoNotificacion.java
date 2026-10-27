package com.aldia.dominio.modelo;

/**
 * Tipos que acepta la tabla notificacion (CHECK ck_notificacion_tipo).
 */
public enum TipoNotificacion {
    /** Se publicó una noticia en la ciudad del usuario. */
    CERCANIA,
    ASCENSO_NIVEL,
    MODERACION,
    COMENTARIO,
    CALIFICACION
}
