package com.aldia.dominio.modelo;

/**
 * Nivel de un usuario (1 Básico, 2 Activo, 3 Corresponsal Certificado). Los valores
 * viven en la tabla nivel: el número, el puntaje para llegar y el límite diario.
 */
public class Nivel {

    private final Long id;
    private final int numero;
    private final String nombre;
    private final int puntajeMinimo;
    private final int limiteNoticiasDiarias;

    public Nivel(Long id, int numero, String nombre, int puntajeMinimo, int limiteNoticiasDiarias) {
        this.id = id;
        this.numero = numero;
        this.nombre = nombre;
        this.puntajeMinimo = puntajeMinimo;
        this.limiteNoticiasDiarias = limiteNoticiasDiarias;
    }

    public Long getId() {
        return id;
    }

    public int getNumero() {
        return numero;
    }

    public String getNombre() {
        return nombre;
    }

    public int getPuntajeMinimo() {
        return puntajeMinimo;
    }

    public int getLimiteNoticiasDiarias() {
        return limiteNoticiasDiarias;
    }
}
