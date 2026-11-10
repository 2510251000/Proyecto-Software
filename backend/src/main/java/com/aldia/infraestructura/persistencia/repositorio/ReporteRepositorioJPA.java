package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.infraestructura.persistencia.entidad.ReporteEntidad;

public interface ReporteRepositorioJPA extends JpaRepository<ReporteEntidad, Long> {

    boolean existsByUsuario_IdAndNoticia_Id(Long usuarioId, Long noticiaId);

    @EntityGraph(attributePaths = {"usuario", "noticia"})
    List<ReporteEntidad> findAllByOrderByFechaDescIdDesc(Pageable pagina);

    @EntityGraph(attributePaths = {"usuario", "noticia"})
    List<ReporteEntidad> findByEstadoOrderByFechaDescIdDesc(EstadoReporte estado, Pageable pagina);

    @EntityGraph(attributePaths = {"usuario", "noticia"})
    Optional<ReporteEntidad> findWithDetallesById(Long id);
}
