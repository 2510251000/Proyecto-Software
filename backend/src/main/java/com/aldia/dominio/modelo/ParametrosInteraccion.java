package com.aldia.dominio.modelo;

/** Límites de los comentarios y reportes (salen de application.yml). */
public record ParametrosInteraccion(int largoMaximoComentario, int largoMaximoDescripcionReporte,
                                    int maximoComentariosListado, int maximoReportesListado) {
}
