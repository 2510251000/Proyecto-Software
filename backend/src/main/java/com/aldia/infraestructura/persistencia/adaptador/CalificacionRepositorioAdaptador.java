package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.ResumenCalificaciones;
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
    public Optional<Integer> buscar(Long usuarioId, Long noticiaId) {
        return repositorio.findByUsuarioIdAndNoticiaId(usuarioId, noticiaId).map(c -> (int) c.getValor());
    }

    @Override
    public void guardar(Long usuarioId, Long noticiaId, int valor, LocalDateTime fecha) {
        CalificacionEntidad entidad = repositorio.findByUsuarioIdAndNoticiaId(usuarioId, noticiaId)
                .orElseGet(() -> new CalificacionEntidad(usuarioId, noticiaId));
        entidad.setValor((short) valor);
        entidad.setFecha(fecha);
        repositorio.save(entidad);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenCalificaciones resumen(Long noticiaId) {
        return resumenes(List.of(noticiaId)).getOrDefault(noticiaId, ResumenCalificaciones.VACIO);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, ResumenCalificaciones> resumenes(List<Long> noticiaIds) {
        if (noticiaIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, ResumenCalificaciones> resultado = new HashMap<>();
        for (CalificacionRepositorioJPA.Resumen fila : repositorio.resumenes(noticiaIds)) {
            resultado.put(fila.getNoticiaId(), new ResumenCalificaciones(fila.getPromedio(), fila.getCantidad()));
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Integer> delUsuario(Long usuarioId, List<Long> noticiaIds) {
        Map<Long, Integer> resultado = new HashMap<>();
        repositorio.findByUsuarioIdAndNoticiaIdIn(usuarioId, noticiaIds)
                .forEach(c -> resultado.put(c.getNoticiaId(), (int) c.getValor()));
        return resultado;
    }
}
