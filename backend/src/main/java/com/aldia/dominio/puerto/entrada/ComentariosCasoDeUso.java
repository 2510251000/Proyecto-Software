package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.Comentario;

public interface ComentariosCasoDeUso {

    /** Comentarios de una noticia publicada (404 si no lo está). */
    List<Comentario> listar(Long noticiaId);

    Comentario comentar(String correo, Long noticiaId, String contenido);

    /** Lo borra su autor o un administrador. */
    void borrar(String correo, Long noticiaId, Long comentarioId);
}
