package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Usuario;

public interface RegistrarUsuarioCasoDeUso {

    Usuario registrar(String correo, String contrasena);
}