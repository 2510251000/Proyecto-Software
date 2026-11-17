package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Alerta;
import com.aldia.dominio.modelo.TipoAlerta;
import com.aldia.dominio.puerto.salida.AlertaRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.AlertaEntidad;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.repositorio.AlertaRepositorioJPA;

@Component
@Transactional
public class AlertaRepositorioAdaptador implements AlertaRepositorioPuerto {

    private static final NoticiaEntidad.Estado PUBLICADA = NoticiaEntidad.Estado.PUBLICADA;

    private final AlertaRepositorioJPA alertaRepositorioJPA;

    public AlertaRepositorioAdaptador(AlertaRepositorioJPA alertaRepositorioJPA) {
        this.alertaRepositorioJPA = alertaRepositorioJPA;
    }

    @Override
    public void guardar(Long noticiaId, TipoAlerta tipo) {
        alertaRepositorioJPA.save(new AlertaEntidad(noticiaId, tipo));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Alerta> buscar(Long noticiaId) {
        return alertaRepositorioJPA.buscarPublicada(noticiaId, PUBLICADA).map(AlertaRepositorioAdaptador::aDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alerta> activasDesde(Long ciudadId, LocalDateTime desde) {
        List<AlertaEntidad> activas = ciudadId == null
                ? alertaRepositorioJPA.activasDesde(desde, PUBLICADA)
                : alertaRepositorioJPA.activasDesdeEnCiudad(ciudadId, desde, PUBLICADA);
        return activas.stream()
                .map(AlertaRepositorioAdaptador::aDominio)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alerta> buscarTodas(Collection<Long> noticiaIds) {
        if (noticiaIds.isEmpty()) {
            return List.of();
        }
        return alertaRepositorioJPA.buscarPublicadas(noticiaIds, PUBLICADA).stream()
                .map(AlertaRepositorioAdaptador::aDominio)
                .toList();
    }

    @Override
    public void resolver(Long noticiaId, LocalDateTime fecha) {
        alertaRepositorioJPA.findById(noticiaId).ifPresent(alerta -> {
            alerta.resolver(fecha);
            alertaRepositorioJPA.save(alerta);
        });
    }

    private static Alerta aDominio(AlertaEntidad entidad) {
        NoticiaEntidad noticia = entidad.getNoticia();
        return new Alerta(entidad.getNoticiaId(), entidad.getTipo(), noticia.getTitulo(), noticia.getResumen(),
                noticia.getCiudad().getNombre(), noticia.getCiudad().getId(), noticia.getUsuario().getId(),
                noticia.getFechaPublicacion(), entidad.isActiva(), entidad.getFechaResuelta());
    }
}
