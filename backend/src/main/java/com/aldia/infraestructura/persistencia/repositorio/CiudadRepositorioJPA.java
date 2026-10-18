package com.aldia.infraestructura.persistencia.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.CiudadEntidad;

public interface CiudadRepositorioJPA extends JpaRepository<CiudadEntidad, Long> {
}
