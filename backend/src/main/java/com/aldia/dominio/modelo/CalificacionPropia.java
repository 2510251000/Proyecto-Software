package com.aldia.dominio.modelo;

/** El resultado de votar: la reputación nueva del autor y el voto que dio el usuario. */
public record CalificacionPropia(ReputacionAutor reputacion, boolean recomienda) {
}
