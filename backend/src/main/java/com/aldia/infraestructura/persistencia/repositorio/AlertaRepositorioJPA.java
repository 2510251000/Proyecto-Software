package com.aldia.infraestructura.persistencia.repositorio;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aldia.infraestructura.persistencia.entidad.AlertaEntidad;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;

public interface AlertaRepositorioJPA extends JpaRepository<AlertaEntidad, Long> {

    String CON_NOTICIA = "select a from AlertaEntidad a join fetch a.noticia n join fetch n.ciudad "
            + "join fetch n.usuario where n.estado = :estado ";

    @Query(CON_NOTICIA + "and a.noticiaId = :noticiaId")
    Optional<AlertaEntidad> buscarPublicada(@Param("noticiaId") Long noticiaId,
                                            @Param("estado") NoticiaEntidad.Estado estado);

    @Query(CON_NOTICIA + "and a.activa = true and n.fechaPublicacion >= :desde order by n.fechaPublicacion desc")
    List<AlertaEntidad> activasDesde(@Param("desde") LocalDateTime desde,
                                     @Param("estado") NoticiaEntidad.Estado estado);

    @Query(CON_NOTICIA + "and a.activa = true and n.fechaPublicacion >= :desde and n.ciudad.id = :ciudadId "
            + "order by n.fechaPublicacion desc")
    List<AlertaEntidad> activasDesdeEnCiudad(@Param("ciudadId") Long ciudadId, @Param("desde") LocalDateTime desde,
                                             @Param("estado") NoticiaEntidad.Estado estado);

    @Query(CON_NOTICIA + "and a.noticiaId in :noticiaIds")
    List<AlertaEntidad> buscarPublicadas(@Param("noticiaIds") Collection<Long> noticiaIds,
                                         @Param("estado") NoticiaEntidad.Estado estado);
}
