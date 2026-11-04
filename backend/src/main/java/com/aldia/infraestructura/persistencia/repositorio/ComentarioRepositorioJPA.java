package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.ComentarioEntidad;

public interface ComentarioRepositorioJPA extends JpaRepository<ComentarioEntidad, Long> {

    @EntityGraph(attributePaths = {"usuario", "usuario.nivel"})
    List<ComentarioEntidad> findByNoticiaIdOrderByFechaAscIdAsc(Long noticiaId, Pageable pagina);
}
