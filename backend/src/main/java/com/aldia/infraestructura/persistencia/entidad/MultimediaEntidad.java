package com.aldia.infraestructura.persistencia.entidad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Una foto de una noticia. En «url» se guarda la clave del archivo en el almacén. */
@Entity
@Table(name = "multimedia")
public class MultimediaEntidad {

    public static final String TIPO_IMAGEN = "IMAGEN";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    private String tipo;

    private short orden;

    @Column(name = "noticia_id")
    private Long noticiaId;

    private String textoAlternativo;

    public MultimediaEntidad() {
    }

    public MultimediaEntidad(Long noticiaId, short orden, String url, String textoAlternativo) {
        this.noticiaId = noticiaId;
        this.orden = orden;
        this.url = url;
        this.textoAlternativo = textoAlternativo;
        this.tipo = TIPO_IMAGEN;
    }

    public Long getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public String getTipo() {
        return tipo;
    }

    public short getOrden() {
        return orden;
    }

    public Long getNoticiaId() {
        return noticiaId;
    }

    public String getTextoAlternativo() {
        return textoAlternativo;
    }
}
