package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;

public interface NoticiaRepositorioJPA extends JpaRepository<NoticiaEntidad, Long> {

    // Trae la ciudad y el usuario en la misma consulta para no hacer una consulta extra por noticia.
    @EntityGraph(attributePaths = {"ciudad", "usuario"})
    List<NoticiaEntidad> findByEstadoOrderByFechaPublicacionDesc(NoticiaEntidad.Estado estado);
}
