package com.aldia.infraestructura.persistencia.adaptador;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.infraestructura.persistencia.mapeador.NotificacionMapeador;
import com.aldia.infraestructura.persistencia.repositorio.NotificacionRepositorioJPA;

@Component
@Transactional
public class NotificacionRepositorioAdaptador implements NotificacionRepositorioPuerto {

    private final NotificacionRepositorioJPA notificacionRepositorioJPA;

    public NotificacionRepositorioAdaptador(NotificacionRepositorioJPA notificacionRepositorioJPA) {
        this.notificacionRepositorioJPA = notificacionRepositorioJPA;
    }

    @Override
    public void guardarTodas(List<Notificacion> notificaciones) {
        if (!notificaciones.isEmpty()) {
            notificacionRepositorioJPA.saveAll(notificaciones.stream().map(NotificacionMapeador::aEntidad).toList());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notificacion> listarDelUsuario(Long usuarioId, int limite) {
        return notificacionRepositorioJPA.findByUsuarioIdOrderByFechaDescIdDesc(usuarioId, PageRequest.of(0, limite))
                .stream()
                .map(NotificacionMapeador::aDominio)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepositorioJPA.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Override
    public boolean marcarLeida(Long notificacionId, Long usuarioId) {
        return notificacionRepositorioJPA.marcarLeida(notificacionId, usuarioId) > 0;
    }

    @Override
    public void marcarTodasLeidas(Long usuarioId) {
        notificacionRepositorioJPA.marcarTodasLeidas(usuarioId);
    }
}
