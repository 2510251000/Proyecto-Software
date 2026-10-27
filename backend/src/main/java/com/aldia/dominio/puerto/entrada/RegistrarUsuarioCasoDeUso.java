package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.NuevoUsuario;
import com.aldia.dominio.modelo.Usuario;

public interface RegistrarUsuarioCasoDeUso {

    Usuario registrar(NuevoUsuario datos);
}
