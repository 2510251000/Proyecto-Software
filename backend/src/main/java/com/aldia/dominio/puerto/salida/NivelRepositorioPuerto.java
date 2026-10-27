package com.aldia.dominio.puerto.salida;

import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Nivel;

public interface NivelRepositorioPuerto {

    /**
     * Nivel con el que entra todo usuario nuevo: el de menor puntaje mínimo.
     */
    Optional<Nivel> buscarNivelInicial();

    /** Todos los niveles, del más bajo al más alto. */
    List<Nivel> listarTodos();
}
