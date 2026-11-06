package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

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

import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;

@Entity
@Table(name = "reporte")
public class ReporteEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MotivoReporte motivo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private EstadoReporte estado;

    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioEntidad usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "noticia_id")
    private NoticiaEntidad noticia;

    public ReporteEntidad() {
    }

    public ReporteEntidad(MotivoReporte motivo, String descripcion, LocalDateTime fecha, UsuarioEntidad usuario,
                          NoticiaEntidad noticia) {
        this.motivo = motivo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.usuario = usuario;
        this.noticia = noticia;
        this.estado = EstadoReporte.PENDIENTE;
    }

    public Long getId() {
        return id;
    }

    public MotivoReporte getMotivo() {
        return motivo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public EstadoReporte getEstado() {
        return estado;
    }

    public void setEstado(EstadoReporte estado) {
        this.estado = estado;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public UsuarioEntidad getUsuario() {
        return usuario;
    }

    public NoticiaEntidad getNoticia() {
        return noticia;
    }
}
