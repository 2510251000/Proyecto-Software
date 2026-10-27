package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aldia.infraestructura.persistencia.entidad.NotificacionEntidad;

public interface NotificacionRepositorioJPA extends JpaRepository<NotificacionEntidad, Long> {

    List<NotificacionEntidad> findByUsuarioIdOrderByFechaDescIdDesc(Long usuarioId, Pageable pagina);

    long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    @Modifying
    @Query("update NotificacionEntidad n set n.leida = true where n.id = :id and n.usuarioId = :usuarioId")
    int marcarLeida(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

    @Modifying
    @Query("update NotificacionEntidad n set n.leida = true where n.usuarioId = :usuarioId and n.leida = false")
    int marcarTodasLeidas(@Param("usuarioId") Long usuarioId);
}
