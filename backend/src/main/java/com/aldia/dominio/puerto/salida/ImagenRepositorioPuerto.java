package com.aldia.dominio.puerto.salida;

import java.util.List;
import java.util.Map;

import com.aldia.dominio.modelo.ImagenNoticia;

/** Las fotos de cada noticia (tabla multimedia). */
public interface ImagenRepositorioPuerto {

    void guardarTodas(Long noticiaId, List<ImagenNoticia> imagenes);

    /** Las fotos de la noticia, en orden. */
    List<ImagenNoticia> buscarDeNoticia(Long noticiaId);

    /** Las fotos de varias noticias a la vez, por id de noticia y en orden. */
    Map<Long, List<ImagenNoticia>> buscarDeNoticias(List<Long> noticiaIds);
}
