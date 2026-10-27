package com.aldia.infraestructura.persistencia.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.HistorialEntidad;

public interface HistorialRepositorioJPA extends JpaRepository<HistorialEntidad, Long> {
}
