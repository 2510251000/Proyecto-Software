package com.aldia.dominio.puerto.salida;

import java.util.Optional;

import com.aldia.dominio.modelo.Usuario;

public interface UsuarioRepositorioPuerto {

    Usuario guardar(Usuario usuario);

    Optional<Usuario> buscarPorCorreo(String correo);

    boolean existePorCorreo(String correo);
}