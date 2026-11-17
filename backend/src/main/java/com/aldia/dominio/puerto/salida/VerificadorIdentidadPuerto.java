package com.aldia.dominio.puerto.salida;

import com.aldia.dominio.modelo.IdentidadExterna;

/** Comprueba el token que entrega el proveedor externo y dice de quién es. */
public interface VerificadorIdentidadPuerto {

    /**
     * Lanza CredencialesInvalidasExcepcion si el token no es válido o el correo no está verificado,
     * e InicioExternoNoDisponibleExcepcion si el inicio con el proveedor no está configurado.
     */
    IdentidadExterna verificar(String token);
}
