package com.aldia.dominio.puerto.entrada;

public interface IniciarSesionExternaCasoDeUso {

    /**
     * Inicia sesión con el token de Google (Firebase). Si el correo no tiene cuenta, la crea
     * como usuario común de nivel 1, sin ciudad (la elige después en su perfil).
     * Devuelve el token JWT de Al Día, el mismo que el inicio con contraseña.
     */
    String iniciarSesion(String tokenExterno);
}
