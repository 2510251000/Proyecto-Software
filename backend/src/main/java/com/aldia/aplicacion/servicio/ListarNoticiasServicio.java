package com.aldia.aplicacion.servicio;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ListarNoticiasCasoDeUso;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;

@Service
public class ListarNoticiasServicio implements ListarNoticiasCasoDeUso {

    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    public ListarNoticiasServicio(NoticiaRepositorioPuerto noticiaRepositorioPuerto) {
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
    }

    @Override
    public List<Noticia> listarPublicadas() {
        return noticiaRepositorioPuerto.buscarPublicadasOrdenadasPorFecha();
    }
}