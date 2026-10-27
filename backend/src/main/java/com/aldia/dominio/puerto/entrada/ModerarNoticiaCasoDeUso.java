package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.Noticia;

public interface ModerarNoticiaCasoDeUso {

    List<Noticia> listar(Noticia.Estado estado, Boolean oficial);

    /** Oculta, vuelve a publicar o borra (borrado lógico: estado ELIMINADA) una noticia. */
    Noticia cambiarEstado(String correoAdministrador, Long noticiaId, Noticia.Estado nuevoEstado);
}
