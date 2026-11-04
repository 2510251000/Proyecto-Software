package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.aldia.dominio.modelo.ResumenCalificaciones;

public interface CalificacionRepositorioPuerto {

    Optional<Integer> buscar(Long usuarioId, Long noticiaId);

    /** Crea la calificación o, si el usuario ya había calificado, cambia su valor. */
    void guardar(Long usuarioId, Long noticiaId, int valor, LocalDateTime fecha);

    ResumenCalificaciones resumen(Long noticiaId);

    /** Resumen de varias noticias a la vez; las que no tienen calificaciones no aparecen. */
    Map<Long, ResumenCalificaciones> resumenes(List<Long> noticiaIds);

    /** El valor que el usuario le dio a cada noticia que calificó. */
    Map<Long, Integer> delUsuario(Long usuarioId, List<Long> noticiaIds);
}
