package com.aldia.infraestructura.persistencia.adaptador;

import org.springframework.stereotype.Component;

import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.infraestructura.persistencia.repositorio.CiudadRepositorioJPA;

@Component
public class CiudadRepositorioAdaptador implements CiudadRepositorioPuerto {

    private final CiudadRepositorioJPA ciudadRepositorioJPA;

    public CiudadRepositorioAdaptador(CiudadRepositorioJPA ciudadRepositorioJPA) {
        this.ciudadRepositorioJPA = ciudadRepositorioJPA;
    }

    @Override
    public boolean existePorId(Long id) {
        return id != null && ciudadRepositorioJPA.existsById(id);
    }
}
