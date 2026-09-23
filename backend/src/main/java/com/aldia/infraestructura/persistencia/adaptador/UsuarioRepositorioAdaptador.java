package com.aldia.infraestructura.persistencia.adaptador;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;
import com.aldia.infraestructura.persistencia.mapeador.UsuarioMapeadorPersistencia;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
public class UsuarioRepositorioAdaptador implements UsuarioRepositorioPuerto {

    private final UsuarioRepositorioJPA usuarioRepositorioJPA;
    private final UsuarioMapeadorPersistencia mapeador;

    public UsuarioRepositorioAdaptador(UsuarioRepositorioJPA usuarioRepositorioJPA,
                                        UsuarioMapeadorPersistencia mapeador) {
        this.usuarioRepositorioJPA = usuarioRepositorioJPA;
        this.mapeador = mapeador;
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        UsuarioEntidad entidad = mapeador.aEntidad(usuario);
        UsuarioEntidad guardada = usuarioRepositorioJPA.save(entidad);
        return mapeador.aDominio(guardada);
    }

    @Override
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepositorioJPA.findByCorreo(correo)
                .map(mapeador::aDominio);
    }

    @Override
    public boolean existePorCorreo(String correo) {
        return usuarioRepositorioJPA.existsByCorreo(correo);
    }
}