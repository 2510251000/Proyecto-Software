package com.aldia.aplicacion.servicio;

import java.util.List;

import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ListarNoticiasCasoDeUso;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.servicio.PoliticaRecomendacion;

public class ListarNoticiasServicio implements ListarNoticiasCasoDeUso {

    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;
    private final PoliticaRecomendacion politicaRecomendacion;
    private final int maximoListado;

    public ListarNoticiasServicio(NoticiaRepositorioPuerto noticiaRepositorioPuerto,
                                  PoliticaRecomendacion politicaRecomendacion,
                                  int maximoListado) {
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
        this.politicaRecomendacion = politicaRecomendacion;
        this.maximoListado = maximoListado;
    }

    @Override
    public List<Noticia> listarPublicadas(FiltroNoticias filtro) {
        List<Noticia> noticias = noticiaRepositorioPuerto.buscarPublicadas(filtro, maximoListado);
        return filtro.orden() == FiltroNoticias.Orden.RECOMENDADAS
                ? politicaRecomendacion.ordenar(noticias)
                : noticias;
    }
}
