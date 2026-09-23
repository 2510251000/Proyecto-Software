package com.aldia.infraestructura.persistencia.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;

public interface UsuarioRepositorioJPA extends JpaRepository<UsuarioEntidad, Long> {

    Optional<UsuarioEntidad> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
}