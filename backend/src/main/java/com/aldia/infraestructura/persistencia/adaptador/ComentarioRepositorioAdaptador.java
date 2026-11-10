package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.puerto.salida.ComentarioRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.ComentarioEntidad;
import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;
import com.aldia.infraestructura.persistencia.mapeador.NoticiaMapeador;
import com.aldia.infraestructura.persistencia.repositorio.ComentarioRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
@Transactional
public class ComentarioRepositorioAdaptador implements ComentarioRepositorioPuerto {

    private final ComentarioRepositorioJPA repositorio;
    private final UsuarioRepositorioJPA usuarios;

    public ComentarioRepositorioAdaptador(ComentarioRepositorioJPA repositorio, UsuarioRepositorioJPA usuarios) {
        this.repositorio = repositorio;
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Comentario> listarDeNoticia(Long noticiaId, int limite) {
        return repositorio.findByNoticiaIdOrderByFechaAscIdAsc(noticiaId, PageRequest.of(0, limite)).stream()
                .map(ComentarioRepositorioAdaptador::aDominio)
                .toList();
    }

    @Override
    public Comentario guardar(Long noticiaId, Long usuarioId, String contenido, LocalDateTime fecha) {
        UsuarioEntidad autor = usuarios.findById(usuarioId).orElseThrow();
        return aDominio(repositorio.save(new ComentarioEntidad(contenido, fecha, autor, noticiaId)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Comentario> buscarPorId(Long id) {
        return repositorio.findById(id).map(ComentarioRepositorioAdaptador::aDominio);
    }

    @Override
    public void borrar(Long id) {
        repositorio.deleteById(id);
    }

    private static Comentario aDominio(ComentarioEntidad entidad) {
        UsuarioEntidad autor = entidad.getUsuario();
        int nivel = autor.getNivel() != null ? autor.getNivel().getNumero() : 1;
        return new Comentario(entidad.getId(), entidad.getNoticiaId(), autor.getId(), NoticiaMapeador.nombreVisible(autor),
                nivel, entidad.getContenido(), entidad.getFecha());
    }
}
