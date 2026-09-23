package com.aldia.infraestructura.persistencia.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.NivelEntidad;

public interface NivelRepositorioJPA extends JpaRepository<NivelEntidad, Long> {

    Optional<NivelEntidad> findFirstByOrderByPuntajeMinimoAsc();
}
