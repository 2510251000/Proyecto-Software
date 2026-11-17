package com.aldia.dominio.modelo;

/**
 * Qué está pasando en una alerta de emergencia (CHECK ck_alerta_tipo).
 */
public enum TipoAlerta {
    /** Una persona desaparecida: se busca a alguien. */
    DESAPARICION("Desaparición"),
    /** Un robo: se busca un vehículo, un objeto o a los responsables. */
    ROBO("Robo"),
    /** Cualquier otra urgencia: incendio, inundación, vía cerrada, peligro inmediato. */
    EMERGENCIA("Emergencia");

    private final String nombre;

    TipoAlerta(String nombre) {
        this.nombre = nombre;
    }

    /** Cómo se lee en los avisos: «Desaparición», «Robo», «Emergencia». */
    public String getNombre() {
        return nombre;
    }
}
