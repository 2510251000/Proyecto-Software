package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

/**
 * Denuncia de un usuario sobre una noticia, para que el administrador la revise.
 * Lleva el título y el estado de la noticia para mostrarlos en el panel.
 */
public record Reporte(Long id, Long noticiaId, String noticiaTitulo, Noticia.Estado noticiaEstado,
                      Long usuarioId, String usuarioNombre, MotivoReporte motivo, String descripcion,
                      EstadoReporte estado, LocalDateTime fecha) {
}
