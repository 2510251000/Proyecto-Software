package com.aldia.dominio.puerto.salida;

import com.aldia.dominio.modelo.Usuario;

public interface TokenPuerto {

    String generarToken(Usuario usuario);
}