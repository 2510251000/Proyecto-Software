package com.aldia.infraestructura.persistencia.mapeador;

import com.aldia.dominio.modelo.Notificacion;
import com.aldia.infraestructura.persistencia.entidad.NotificacionEntidad;

public final class NotificacionMapeador {

    private NotificacionMapeador() {
    }

    public static Notificacion aDominio(NotificacionEntidad entidad) {
        return new Notificacion(entidad.getId(), entidad.getUsuarioId(), entidad.getTipo(),
                entidad.getMensaje(), entidad.getNoticiaId(), entidad.isLeida(), entidad.getFecha());
    }

    public static NotificacionEntidad aEntidad(Notificacion notificacion) {
        NotificacionEntidad entidad = new NotificacionEntidad();
        entidad.setId(notificacion.id());
        entidad.setUsuarioId(notificacion.usuarioId());
        entidad.setTipo(notificacion.tipo());
        entidad.setMensaje(notificacion.mensaje());
        entidad.setNoticiaId(notificacion.noticiaId());
        entidad.setLeida(notificacion.leida());
        entidad.setFecha(notificacion.fecha());
        return entidad;
    }
}
