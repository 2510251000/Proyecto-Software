package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Usuario;

public interface ObtenerUsuarioActualCasoDeUso {

    Usuario obtenerPorCorreo(String correo);
}
