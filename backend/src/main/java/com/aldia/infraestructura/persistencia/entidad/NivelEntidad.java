package com.aldia.infraestructura.persistencia.entidad;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "nivel")
public class NivelEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private int limiteNoticiasDiarias;

    public NivelEntidad() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getLimiteNoticiasDiarias() {
        return limiteNoticiasDiarias;
    }

    public void setLimiteNoticiasDiarias(int limiteNoticiasDiarias) {
        this.limiteNoticiasDiarias = limiteNoticiasDiarias;
    }
}