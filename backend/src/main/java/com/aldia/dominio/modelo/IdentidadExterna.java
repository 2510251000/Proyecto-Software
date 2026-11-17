package com.aldia.dominio.modelo;

/**
 * Quién es la persona según un proveedor externo (Google, a través de Firebase Authentication).
 * Solo se acepta con el correo verificado por el proveedor.
 */
public record IdentidadExterna(String correo, String nombre) {
}
