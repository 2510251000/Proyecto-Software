package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Usuario;

public interface ActualizarPerfilCasoDeUso {

    Usuario actualizar(String correo, String nombre, Long ciudadId);
}
