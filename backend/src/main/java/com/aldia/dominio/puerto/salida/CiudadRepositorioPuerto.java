package com.aldia.dominio.puerto.salida;

import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Ciudad;

public interface CiudadRepositorioPuerto {

    boolean existePorId(Long id);

    Optional<Ciudad> buscarPorId(Long id);

    /** Catálogo completo, en orden alfabético. */
    List<Ciudad> listarTodas();

    Optional<Ciudad> buscarPorIdLugar(String idLugar);

    /** Busca sin distinguir mayúsculas ni tildes. */
    Optional<Ciudad> buscarPorNombreYDepartamento(String nombre, String departamento);

    Ciudad guardar(Ciudad ciudad);
}
