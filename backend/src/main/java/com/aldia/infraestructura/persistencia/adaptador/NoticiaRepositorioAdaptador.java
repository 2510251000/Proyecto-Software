package com.aldia.infraestructura.persistencia.adaptador;

import java.util.List;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.mapeador.NoticiaMapeador;
import com.aldia.infraestructura.persistencia.repositorio.NoticiaRepositorioJPA;

@Component
public class NoticiaRepositorioAdaptador implements NoticiaRepositorioPuerto {

    private final NoticiaRepositorioJPA noticiaRepositorioJPA;
    private final NoticiaMapeador mapeador;

    public NoticiaRepositorioAdaptador(NoticiaRepositorioJPA noticiaRepositorioJPA,
                                       NoticiaMapeador mapeador) {
        this.noticiaRepositorioJPA = noticiaRepositorioJPA;
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
}
