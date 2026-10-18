package com.aldia.dominio.modelo;

/**
 * Lo que el administrador puede cambiar de una cuenta. Un campo en null no se toca.
 */
public record CambiosUsuario(Boolean activo, Usuario.Rol rol, Integer nivel) {
}
