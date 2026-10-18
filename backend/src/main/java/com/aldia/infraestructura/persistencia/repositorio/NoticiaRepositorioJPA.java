package com.aldia.infraestructura.persistencia.repositorio;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;

public interface NoticiaRepositorioJPA extends JpaRepository<NoticiaEntidad, Long>,
        JpaSpecificationExecutor<NoticiaEntidad> {

    // Trae la ciudad y el autor (con su nivel) en la misma consulta para no hacer una consulta extra por noticia.
    @Override
    @EntityGraph(attributePaths = {"ciudad", "usuario", "usuario.nivel", "usuario.ciudad"})
    Page<NoticiaEntidad> findAll(Specification<NoticiaEntidad> filtro, Pageable pagina);

    @EntityGraph(attributePaths = {"ciudad", "usuario", "usuario.nivel"})
    Optional<NoticiaEntidad> findByIdAndEstado(Long id, NoticiaEntidad.Estado estado);

    long countByUsuario_IdAndFechaPublicacionGreaterThanEqual(Long usuarioId, LocalDateTime desde);
}
