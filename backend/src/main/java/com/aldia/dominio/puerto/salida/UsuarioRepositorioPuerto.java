package com.aldia.dominio.puerto.salida;

import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Usuario;

public interface UsuarioRepositorioPuerto {

    Usuario guardar(Usuario usuario);

    Optional<Usuario> buscarPorCorreo(String correo);

    Optional<Usuario> buscarPorId(Long id);

    boolean existePorCorreo(String correo);

    List<Usuario> listarTodos();

    /** Ids de las cuentas activas que viven en la ciudad indicada. */
    List<Long> idsActivosEnCiudad(Long ciudadId);
}
