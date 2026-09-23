package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

public class Noticia {

    private Long id;
    private String titulo;
    private String resumen;
    private String contenido;
    private LocalDateTime fechaPublicacion;
    private boolean oficial;
    private Estado estado;
    private String ciudad;

    public Noticia(Long id, String titulo, String resumen, String contenido,
                    LocalDateTime fechaPublicacion, boolean oficial, Estado estado, String ciudad) {
        this.id = id;
        this.titulo = titulo;
        this.resumen = resumen;
        this.contenido = contenido;
        this.fechaPublicacion = fechaPublicacion;
        this.oficial = oficial;
        this.estado = estado;
        this.ciudad = ciudad;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getResumen() {
        return resumen;
    }

    public String getContenido() {
        return contenido;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }

    public boolean isOficial() {
        return oficial;
    }

    public Estado getEstado() {
        return estado;
    }

    public String getCiudad() {
        return ciudad;
    }

    public enum Estado {
        PUBLICADA,
        OCULTA,
        ELIMINADA
    }
}