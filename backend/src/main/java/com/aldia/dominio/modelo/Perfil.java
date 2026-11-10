package com.aldia.dominio.modelo;

/**
 * Lo que ve el usuario en su perfil: sus datos, el nivel siguiente (null si ya está
 * en el último), su cupo de publicaciones de hoy y lo que opinan los lectores de lo que publica.
 */
public record Perfil(Usuario usuario, Nivel siguienteNivel, CupoDiario cupo, ReputacionAutor reputacion) {
}
