package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.ImagenSubida;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;

public interface PublicarNoticiaCasoDeUso {

    /** Publica sin fotos. */
    default Noticia publicar(String correoAutor, NuevaNoticia datos) {
        return publicar(correoAutor, datos, List.of());
    }

    /** Publica con fotos (la primera es la portada). */
    Noticia publicar(String correoAutor, NuevaNoticia datos, List<ImagenSubida> imagenes);
}
