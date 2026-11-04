package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "comentario")
public class ComentarioEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioEntidad usuario;

    @Column(name = "noticia_id")
    private Long noticiaId;

    public ComentarioEntidad() {
    }

    public ComentarioEntidad(String contenido, LocalDateTime fecha, UsuarioEntidad usuario, Long noticiaId) {
        this.contenido = contenido;
        this.fecha = fecha;
        this.usuario = usuario;
        this.noticiaId = noticiaId;
    }

    public Long getId() {
        return id;
    }

    public String getContenido() {
        return contenido;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public UsuarioEntidad getUsuario() {
        return usuario;
    }

    public Long getNoticiaId() {
        return noticiaId;
    }
}
