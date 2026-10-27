package com.aldia.dominio.modelo;

/**
 * Cuántas noticias puede publicar hoy un usuario.
 *
 * @param limite        límite diario de su nivel
 * @param publicadasHoy cuántas lleva hoy
 * @param ilimitado     true para los administradores (no tienen límite)
 */
public record CupoDiario(int limite, long publicadasHoy, boolean ilimitado) {

    public long restantes() {
        return ilimitado ? Long.MAX_VALUE : Math.max(0, limite - publicadasHoy);
    }

    public boolean puedePublicar() {
        return ilimitado || publicadasHoy < limite;
    }
}
