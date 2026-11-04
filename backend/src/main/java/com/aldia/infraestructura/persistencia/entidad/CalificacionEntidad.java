package com.aldia.infraestructura.persistencia.entidad;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "calificacion")
public class CalificacionEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private short valor;

    private LocalDateTime fecha;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "noticia_id")
    private Long noticiaId;

    public CalificacionEntidad() {
    }

    public CalificacionEntidad(Long usuarioId, Long noticiaId) {
        this.usuarioId = usuarioId;
        this.noticiaId = noticiaId;
    }

    public Long getId() {
        return id;
    }

    public short getValor() {
        return valor;
    }

    public void setValor(short valor) {
        this.valor = valor;
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

    public Long getNoticiaId() {
        return noticiaId;
    }
}
