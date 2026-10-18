package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.CambiosUsuario;
import com.aldia.dominio.modelo.Usuario;

public interface GestionarUsuariosCasoDeUso {

    List<Usuario> listar();

    Usuario actualizar(String correoAdministrador, Long usuarioId, CambiosUsuario cambios);
}
