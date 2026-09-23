package com.aldia.infraestructura.persistencia.adaptador;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.infraestructura.persistencia.repositorio.NivelRepositorioJPA;

@Component
public class NivelRepositorioAdaptador implements NivelRepositorioPuerto {

    private final NivelRepositorioJPA nivelRepositorioJPA;

    public NivelRepositorioAdaptador(NivelRepositorioJPA nivelRepositorioJPA) {
        this.nivelRepositorioJPA = nivelRepositorioJPA;
    }

    @Override
    public Optional<Nivel> buscarNivelInicial() {
        return nivelRepositorioJPA.findFirstByOrderByPuntajeMinimoAsc()
                .map(entidad -> new Nivel(
                        entidad.getId(),
                        entidad.getNombre(),
                        entidad.getLimiteNoticiasDiarias()
                ));
    }
}
