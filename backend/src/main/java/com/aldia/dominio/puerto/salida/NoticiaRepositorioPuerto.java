package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;

public interface NoticiaRepositorioPuerto {

    List<Noticia> buscarPublicadasOrdenadasPorFecha();

    Optional<Noticia> buscarPublicadaPorId(Long id);

    /**
     * Cuántas noticias ha publicado el autor desde el momento indicado (en cualquier estado).
     */
    long contarDelAutorDesde(Long autorId, LocalDateTime desde);

    Noticia guardarNueva(NuevaNoticia datos, Long autorId, boolean oficial, LocalDateTime fechaPublicacion);
}
