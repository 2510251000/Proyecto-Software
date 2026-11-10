package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import com.aldia.dominio.modelo.ReputacionAutor;

public interface CalificacionRepositorioPuerto {

    Optional<Boolean> buscar(Long usuarioId, Long noticiaId);

    /** Crea el voto o, si el usuario ya había votado en esa noticia, lo cambia. */
    void guardar(Long usuarioId, Long noticiaId, boolean recomienda, LocalDateTime fecha);

    /** Votos de todas las noticias del autor. */
    ReputacionAutor reputacion(Long autorId);

    /** Reputación de varios autores a la vez; los que no tienen votos no aparecen. */
    Map<Long, ReputacionAutor> reputaciones(Collection<Long> autorIds);

    /** El voto del usuario en cada noticia donde votó. */
    Map<Long, Boolean> delUsuario(Long usuarioId, Collection<Long> noticiaIds);
}
