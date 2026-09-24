package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Noticia;

public interface ObtenerNoticiaCasoDeUso {

    Noticia obtenerPublicada(Long id);
}
