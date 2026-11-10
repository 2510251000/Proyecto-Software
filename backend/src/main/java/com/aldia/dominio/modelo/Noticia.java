package com.aldia.dominio.modelo;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Noticia {

    private final Long id;
    private final String titulo;
    private final String resumen;
    private final String contenido;
    private final LocalDateTime fechaPublicacion;
    private final boolean oficial;
    private final Estado estado;
    private final String ciudad;
    private final Long ciudadId;
    private final Long autorId;
    private final String autorNombre;
    /** Número de nivel del autor (1 a 3) al momento de consultar. */
    private final int autorNivel;
    private final BigDecimal latitud;
    private final BigDecimal longitud;
    /** Fotos en orden; la primera es la portada. Vacía si la noticia no tiene fotos. */
    private final List<ImagenNoticia> imagenes;
    /** Votos de los lectores al autor en todas sus noticias (SIN_VOTOS si nadie ha votado). */
    private ReputacionAutor reputacionAutor = ReputacionAutor.SIN_VOTOS;

    public Noticia(Long id, String titulo, String resumen, String contenido,
                   LocalDateTime fechaPublicacion, boolean oficial, Estado estado, String ciudad) {
        this(id, titulo, resumen, contenido, fechaPublicacion, oficial, estado, ciudad,
                null, null, null, 1, null, null);
    }

    public Noticia(Long id, String titulo, String resumen, String contenido,
                   LocalDateTime fechaPublicacion, boolean oficial, Estado estado, String ciudad,
                   Long ciudadId, Long autorId, String autorNombre, int autorNivel,
                   BigDecimal latitud, BigDecimal longitud) {
        this(id, titulo, resumen, contenido, fechaPublicacion, oficial, estado, ciudad, ciudadId, autorId,
                autorNombre, autorNivel, latitud, longitud, List.of());
    }

    @SuppressWarnings("java:S107") // Es el modelo completo de la noticia: un parámetro por dato.
    public Noticia(Long id, String titulo, String resumen, String contenido,
                   LocalDateTime fechaPublicacion, boolean oficial, Estado estado, String ciudad,
                   Long ciudadId, Long autorId, String autorNombre, int autorNivel,
                   BigDecimal latitud, BigDecimal longitud, List<ImagenNoticia> imagenes) {
        this.id = id;
        this.titulo = titulo;
        this.resumen = resumen;
        this.contenido = contenido;
        this.fechaPublicacion = fechaPublicacion;
        this.oficial = oficial;
        this.estado = estado;
        this.ciudad = ciudad;
        this.ciudadId = ciudadId;
        this.autorId = autorId;
        this.autorNombre = autorNombre;
        this.autorNivel = autorNivel;
        this.latitud = latitud;
        this.longitud = longitud;
        this.imagenes = imagenes == null ? List.of() : List.copyOf(imagenes);
    }

    /** La misma noticia con estas fotos. */
    public Noticia conImagenes(List<ImagenNoticia> nuevas) {
        Noticia copia = new Noticia(id, titulo, resumen, contenido, fechaPublicacion, oficial, estado, ciudad, ciudadId,
                autorId, autorNombre, autorNivel, latitud, longitud, nuevas);
        copia.reputacionAutor = reputacionAutor;
        return copia;
    }

    /** La misma noticia con esta reputación de su autor. */
    public Noticia conReputacionAutor(ReputacionAutor nueva) {
        Noticia copia = conImagenes(imagenes);
        copia.reputacionAutor = nueva == null ? ReputacionAutor.SIN_VOTOS : nueva;
        return copia;
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

    public Long getCiudadId() {
        return ciudadId;
    }

    public Long getAutorId() {
        return autorId;
    }

    public String getAutorNombre() {
        return autorNombre;
    }

    public int getAutorNivel() {
        return autorNivel;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public List<ImagenNoticia> getImagenes() {
        return imagenes;
    }

    public ReputacionAutor getReputacionAutor() {
        return reputacionAutor;
    }

    public enum Estado {
        PUBLICADA,
        OCULTA,
        ELIMINADA
    }
}
