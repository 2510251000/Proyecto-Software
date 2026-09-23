package com.aldia.dominio.puerto.salida;

import java.util.List;

import com.aldia.dominio.modelo.Noticia;

public interface NoticiaRepositorioPuerto {

    List<Noticia> buscarPublicadasOrdenadasPorFecha();
}