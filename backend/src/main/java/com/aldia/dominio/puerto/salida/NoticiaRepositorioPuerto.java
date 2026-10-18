package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;

public interface NoticiaRepositorioPuerto {

    /** Noticias PUBLICADAS que cumplen el filtro, de la más reciente a la más antigua. */
    List<Noticia> buscarPublicadas(FiltroNoticias filtro, int limite);

    Optional<Noticia> buscarPublicadaPorId(Long id);

    /** En cualquier estado: la usa la moderación. */
    Optional<Noticia> buscarPorId(Long id);

    /** Para el panel del administrador: todas menos las eliminadas, o solo las del estado indicado. */
    List<Noticia> buscarParaModeracion(Noticia.Estado estado, Boolean oficial, int limite);

    /**
     * Cuántas noticias ha publicado el autor desde el momento indicado (en cualquier estado).
     */
    long contarDelAutorDesde(Long autorId, LocalDateTime desde);

    Noticia guardarNueva(NuevaNoticia datos, Long autorId, boolean oficial, LocalDateTime fechaPublicacion);

    void cambiarEstado(Long id, Noticia.Estado estado);
}
