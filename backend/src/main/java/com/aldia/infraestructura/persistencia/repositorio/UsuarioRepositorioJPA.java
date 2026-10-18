package com.aldia.infraestructura.persistencia.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;

public interface UsuarioRepositorioJPA extends JpaRepository<UsuarioEntidad, Long> {

    Optional<UsuarioEntidad> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    @EntityGraph(attributePaths = {"nivel", "ciudad"})
    List<UsuarioEntidad> findAllByOrderByIdAsc();

    @Query("select u.id from UsuarioEntidad u where u.ciudad.id = :ciudadId and u.activo = true")
    List<Long> idsActivosEnCiudad(@Param("ciudadId") Long ciudadId);
}
