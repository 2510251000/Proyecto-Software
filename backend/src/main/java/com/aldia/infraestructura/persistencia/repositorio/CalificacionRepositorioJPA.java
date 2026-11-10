package com.aldia.infraestructura.persistencia.repositorio;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aldia.infraestructura.persistencia.entidad.CalificacionEntidad;

public interface CalificacionRepositorioJPA extends JpaRepository<CalificacionEntidad, Long> {

    /** Votos positivos y totales que recibió un autor en todas sus noticias. */
    interface Reputacion {
        Long getAutorId();

        Long getPositivos();

        Long getVotos();
    }

    Optional<CalificacionEntidad> findByUsuarioIdAndNoticiaId(Long usuarioId, Long noticiaId);

    List<CalificacionEntidad> findByUsuarioIdAndNoticiaIdIn(Long usuarioId, Collection<Long> noticiaIds);

    @Query("select n.usuario.id as autorId, "
            + "sum(case when c.recomienda = true then 1 else 0 end) as positivos, count(c) as votos "
            + "from CalificacionEntidad c, NoticiaEntidad n "
            + "where n.id = c.noticiaId and n.usuario.id in :autores group by n.usuario.id")
    List<Reputacion> reputaciones(@Param("autores") Collection<Long> autorIds);
}
