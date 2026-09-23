package com.aldia.dominio.modelo;

public class Nivel {

    private Long id;
    private String nombre;
    private int limiteNoticiasDiarias;

    public Nivel(Long id, String nombre, int limiteNoticiasDiarias) {
        this.id = id;
        this.nombre = nombre;
        this.limiteNoticiasDiarias = limiteNoticiasDiarias;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public int getLimiteNoticiasDiarias() {
        return limiteNoticiasDiarias;
    }
}