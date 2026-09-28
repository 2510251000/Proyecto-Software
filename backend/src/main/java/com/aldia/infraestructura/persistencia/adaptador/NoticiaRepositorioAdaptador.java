package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.mapeador.NoticiaMapeador;
import com.aldia.infraestructura.persistencia.repositorio.CiudadRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.NoticiaRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
public class NoticiaRepositorioAdaptador implements NoticiaRepositorioPuerto {

    private final NoticiaRepositorioJPA noticiaRepositorioJPA;
    private final UsuarioRepositorioJPA usuarioRepositorioJPA;
    private final CiudadRepositorioJPA ciudadRepositorioJPA;
    private final NoticiaMapeador mapeador;

    public NoticiaRepositorioAdaptador(NoticiaRepositorioJPA noticiaRepositorioJPA,
                                       UsuarioRepositorioJPA usuarioRepositorioJPA,
                                       CiudadRepositorioJPA ciudadRepositorioJPA,
                                       NoticiaMapeador mapeador) {
        this.noticiaRepositorioJPA = noticiaRepositorioJPA;
        this.usuarioRepositorioJPA = usuarioRepositorioJPA;
        this.ciudadRepositorioJPA = ciudadRepositorioJPA;
        this.mapeador = mapeador;
    }

    @Override
    public List<Noticia> buscarPublicadasOrdenadasPorFecha() {
        return noticiaRepositorioJPA
                .findByEstadoOrderByFechaPublicacionDesc(NoticiaEntidad.Estado.PUBLICADA)
                .stream()
                .map(mapeador::aDominio)
                .toList();
    }

    @Override
    public Optional<Noticia> buscarPublicadaPorId(Long id) {
        return noticiaRepositorioJPA.findByIdAndEstado(id, NoticiaEntidad.Estado.PUBLICADA)
                .map(mapeador::aDominio);
    }

    @Override
    public long contarDelAutorDesde(Long autorId, LocalDateTime desde) {
        return noticiaRepositorioJPA.countByUsuario_IdAndFechaPublicacionGreaterThanEqual(autorId, desde);
    }

    @Override
    public Noticia guardarNueva(NuevaNoticia datos, Long autorId, boolean oficial, LocalDateTime fechaPublicacion) {
        NoticiaEntidad entidad = new NoticiaEntidad();
        entidad.setTitulo(datos.titulo());
        entidad.setResumen(datos.resumen());
        entidad.setContenido(datos.contenido());
        entidad.setLatitud(datos.latitud());
        entidad.setLongitud(datos.longitud());
        entidad.setIdLugarGoogle(datos.idLugarGoogle());
        entidad.setFechaPublicacion(fechaPublicacion);
        entidad.setOficial(oficial);
        entidad.setEstado(NoticiaEntidad.Estado.PUBLICADA);

        // Referencias por id: no hace falta cargar el usuario ni la ciudad completos para guardar.
        entidad.setUsuario(usuarioRepositorioJPA.getReferenceById(autorId));
        entidad.setCiudad(ciudadRepositorioJPA.getReferenceById(datos.ciudadId()));

        return mapeador.aDominio(noticiaRepositorioJPA.save(entidad));
    }
}
