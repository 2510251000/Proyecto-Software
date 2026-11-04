package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Comentario;

public interface ComentarioRepositorioPuerto {

    /** Comentarios de la noticia, del más antiguo al más reciente. */
    List<Comentario> listarDeNoticia(Long noticiaId, int limite);

    Comentario guardar(Long noticiaId, Long usuarioId, String contenido, LocalDateTime fecha);

    Optional<Comentario> buscarPorId(Long id);

    void borrar(Long id);
}
