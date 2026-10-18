package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.CiudadEntidad;

public interface CiudadRepositorioJPA extends JpaRepository<CiudadEntidad, Long> {

    List<CiudadEntidad> findAllByOrderByNombreAsc();

    Optional<CiudadEntidad> findByIdLugar(String idLugar);
}
