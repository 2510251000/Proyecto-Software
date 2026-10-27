package com.aldia.infraestructura.persistencia.adaptador;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;
import com.aldia.infraestructura.persistencia.mapeador.UsuarioMapeadorPersistencia;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
@Transactional
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
        UsuarioEntidad guardada = usuarioRepositorioJPA.saveAndFlush(entidad);
        // Se vuelve a leer para devolver el nivel y la ciudad completos, no solo sus ids.
        return usuarioRepositorioJPA.findById(guardada.getId())
                .map(mapeador::aDominio)
                .orElseThrow();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepositorioJPA.findByCorreo(correo)
                .map(mapeador::aDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepositorioJPA.findById(id).map(mapeador::aDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existePorCorreo(String correo) {
        return usuarioRepositorioJPA.existsByCorreo(correo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepositorioJPA.findAllByOrderByIdAsc().stream().map(mapeador::aDominio).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> idsActivosEnCiudad(Long ciudadId) {
        return ciudadId == null ? List.of() : usuarioRepositorioJPA.idsActivosEnCiudad(ciudadId);
    }
}
