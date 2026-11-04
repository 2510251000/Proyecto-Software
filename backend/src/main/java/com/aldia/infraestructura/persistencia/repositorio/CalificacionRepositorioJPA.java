package com.aldia.infraestructura.persistencia.repositorio;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aldia.infraestructura.persistencia.entidad.CalificacionEntidad;

public interface CalificacionRepositorioJPA extends JpaRepository<CalificacionEntidad, Long> {

    /** Promedio y cantidad por noticia. */
    interface Resumen {
        Long getNoticiaId();

        Double getPromedio();

        Long getCantidad();
    }

    Optional<CalificacionEntidad> findByUsuarioIdAndNoticiaId(Long usuarioId, Long noticiaId);

    List<CalificacionEntidad> findByUsuarioIdAndNoticiaIdIn(Long usuarioId, Collection<Long> noticiaIds);

    @Query("select c.noticiaId as noticiaId, avg(c.valor) as promedio, count(c) as cantidad "
            + "from CalificacionEntidad c where c.noticiaId in :ids group by c.noticiaId")
    List<Resumen> resumenes(@Param("ids") Collection<Long> noticiaIds);
}
