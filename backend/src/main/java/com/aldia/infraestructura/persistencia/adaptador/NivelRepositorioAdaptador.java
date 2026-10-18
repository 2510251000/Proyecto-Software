package com.aldia.infraestructura.persistencia.adaptador;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.infraestructura.persistencia.mapeador.CiudadNivelMapeador;
import com.aldia.infraestructura.persistencia.repositorio.NivelRepositorioJPA;

@Component
@Transactional(readOnly = true)
public class NivelRepositorioAdaptador implements NivelRepositorioPuerto {

    private final NivelRepositorioJPA nivelRepositorioJPA;

    public NivelRepositorioAdaptador(NivelRepositorioJPA nivelRepositorioJPA) {
        this.nivelRepositorioJPA = nivelRepositorioJPA;
    }

    @Override
    public Optional<Nivel> buscarNivelInicial() {
        return nivelRepositorioJPA.findFirstByOrderByPuntajeMinimoAsc().map(CiudadNivelMapeador::aNivel);
    }

    @Override
    public List<Nivel> listarTodos() {
        return nivelRepositorioJPA.findAllByOrderByPuntajeMinimoAsc().stream()
                .map(CiudadNivelMapeador::aNivel)
                .toList();
    }
}
