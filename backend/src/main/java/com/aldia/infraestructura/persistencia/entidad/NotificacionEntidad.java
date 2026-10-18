package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.TipoNotificacion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Las llaves a usuario y noticia se guardan como ids: la bandeja nunca necesita
 * cargar el usuario ni la noticia completos.
 */
@Entity
@Table(name = "notificacion")
public class NotificacionEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Column(nullable = false)
    private boolean leida;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "noticia_id")
    private Long noticiaId;

    public NotificacionEntidad() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public TipoNotificacion getTipo() {
        return tipo;
    }

    public void setTipo(TipoNotificacion tipo) {
        this.tipo = tipo;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getNoticiaId() {
        return noticiaId;
    }

    public void setNoticiaId(Long noticiaId) {
        this.noticiaId = noticiaId;
    }
}
