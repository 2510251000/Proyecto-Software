package com.aldia.dominio.modelo;

/**
 * Lo que ve el usuario en su perfil: sus datos, el nivel siguiente (null si ya está
 * en el último) y su cupo de publicaciones de hoy.
 */
public record Perfil(Usuario usuario, Nivel siguienteNivel, CupoDiario cupo) {
}
