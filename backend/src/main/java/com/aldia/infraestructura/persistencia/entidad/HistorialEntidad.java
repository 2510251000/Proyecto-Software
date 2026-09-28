package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.AccionHistorial;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "historial")
public class HistorialEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccionHistorial accion;

    private String detalle;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntidad usuario;

    public HistorialEntidad() {
    }

    public Long getId() {
        return id;
    }

    public AccionHistorial getAccion() {
        return accion;
    }

    public void setAccion(AccionHistorial accion) {
        this.accion = accion;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public UsuarioEntidad getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioEntidad usuario) {
        this.usuario = usuario;
    }
}
