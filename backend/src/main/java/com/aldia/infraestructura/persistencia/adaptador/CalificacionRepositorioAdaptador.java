package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.ReputacionAutor;
import com.aldia.dominio.puerto.salida.CalificacionRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.CalificacionEntidad;
import com.aldia.infraestructura.persistencia.repositorio.CalificacionRepositorioJPA;

@Component
@Transactional
public class CalificacionRepositorioAdaptador implements CalificacionRepositorioPuerto {

    private final CalificacionRepositorioJPA repositorio;

    public CalificacionRepositorioAdaptador(CalificacionRepositorioJPA repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Boolean> buscar(Long usuarioId, Long noticiaId) {
        return repositorio.findByUsuarioIdAndNoticiaId(usuarioId, noticiaId).map(CalificacionEntidad::isRecomienda);
    }

    @Override
    public void guardar(Long usuarioId, Long noticiaId, boolean recomienda, LocalDateTime fecha) {
        CalificacionEntidad entidad = repositorio.findByUsuarioIdAndNoticiaId(usuarioId, noticiaId)
                .orElseGet(() -> new CalificacionEntidad(usuarioId, noticiaId));
        entidad.setRecomienda(recomienda);
        entidad.setFecha(fecha);
        repositorio.save(entidad);
    }

    @Override
    @Transactional(readOnly = true)
    public ReputacionAutor reputacion(Long autorId) {
        return reputaciones(List.of(autorId)).getOrDefault(autorId, ReputacionAutor.SIN_VOTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, ReputacionAutor> reputaciones(Collection<Long> autorIds) {
        Map<Long, ReputacionAutor> resultado = new HashMap<>();
        if (autorIds.isEmpty()) {
            return resultado;
        }
        for (CalificacionRepositorioJPA.Reputacion fila : repositorio.reputaciones(autorIds)) {
            resultado.put(fila.getAutorId(), new ReputacionAutor(fila.getPositivos(), fila.getVotos()));
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Boolean> delUsuario(Long usuarioId, Collection<Long> noticiaIds) {
        Map<Long, Boolean> resultado = new HashMap<>();
        repositorio.findByUsuarioIdAndNoticiaIdIn(usuarioId, noticiaIds)
                .forEach(c -> resultado.put(c.getNoticiaId(), c.isRecomienda()));
        return resultado;
    }
}
