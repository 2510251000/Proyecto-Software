package com.aldia.infraestructura.persistencia.entidad;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "noticia")
public class NoticiaEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String resumen;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    private LocalDateTime fechaPublicacion;

    private boolean oficial;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitud;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitud;

    private String idLugarGoogle;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UsuarioEntidad usuario;

    @ManyToOne
    @JoinColumn(name = "ciudad_id")
    private CiudadEntidad ciudad;

    public NoticiaEntidad() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getResumen() {
        return resumen;
    }

    public void setResumen(String resumen) {
        this.resumen = resumen;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }

    public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }

    public boolean isOficial() {
        return oficial;
    }

    public void setOficial(boolean oficial) {
        this.oficial = oficial;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }

    public String getIdLugarGoogle() {
        return idLugarGoogle;
    }

    public void setIdLugarGoogle(String idLugarGoogle) {
        this.idLugarGoogle = idLugarGoogle;
    }

    public UsuarioEntidad getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioEntidad usuario) {
        this.usuario = usuario;
    }

    public CiudadEntidad getCiudad() {
        return ciudad;
    }

    public void setCiudad(CiudadEntidad ciudad) {
        this.ciudad = ciudad;
    }

    public enum Estado {
        PUBLICADA,
        OCULTA,
        ELIMINADA
    }
}