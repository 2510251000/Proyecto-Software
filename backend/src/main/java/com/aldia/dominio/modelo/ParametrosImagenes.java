package com.aldia.dominio.modelo;

/** Límites de las fotos de una noticia (salen de application.yml). */
public record ParametrosImagenes(int maximoPorNoticia, long tamanoMaximoBytes, int anchoMaximo, int altoMaximo,
                                 int largoMaximoTextoAlternativo) {
}
