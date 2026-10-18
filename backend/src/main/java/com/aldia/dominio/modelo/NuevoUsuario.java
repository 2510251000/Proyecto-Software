package com.aldia.dominio.modelo;

/**
 * Datos que pide el registro. La ciudad es la que se obtuvo con la API de ubicación.
 */
public record NuevoUsuario(String correo, String contrasena, String nombre, Long ciudadId) {
}
