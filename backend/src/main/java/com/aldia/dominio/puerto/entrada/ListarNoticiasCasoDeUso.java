package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;

public interface ListarNoticiasCasoDeUso {

    List<Noticia> listarPublicadas(FiltroNoticias filtro);
}
