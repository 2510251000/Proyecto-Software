package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.TipoAlerta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** La llave es la de la noticia: una noticia tiene a lo sumo una alerta. */
@Entity
@Table(name = "alerta")
public class AlertaEntidad {

    @Id
    @Column(name = "noticia_id")
    private Long noticiaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "noticia_id", insertable = false, updatable = false)
    private NoticiaEntidad noticia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAlerta tipo;

    @Column(nullable = false)
    private boolean activa;

    @Column(name = "fecha_resuelta")
    private LocalDateTime fechaResuelta;

    public AlertaEntidad() {
    }

    public AlertaEntidad(Long noticiaId, TipoAlerta tipo) {
        this.noticiaId = noticiaId;
        this.tipo = tipo;
        this.activa = true;
    }

    public Long getNoticiaId() {
        return noticiaId;
    }

    public NoticiaEntidad getNoticia() {
        return noticia;
    }

    public TipoAlerta getTipo() {
        return tipo;
    }

    public boolean isActiva() {
        return activa;
    }

    public LocalDateTime getFechaResuelta() {
        return fechaResuelta;
    }

    public void resolver(LocalDateTime fecha) {
        this.activa = false;
        this.fechaResuelta = fecha;
    }
}
