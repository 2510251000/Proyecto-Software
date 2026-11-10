package com.aldia.dominio.puerto.entrada;

import java.util.List;
import java.util.Map;

import com.aldia.dominio.modelo.CalificacionPropia;

/** Votar al autor desde una de sus noticias: «sigue publicando así» o «no me gustó esto». */
public interface CalificarNoticiaCasoDeUso {

    /** Registra el voto; si ya había votado en esa noticia, lo cambia. */
    CalificacionPropia calificar(String correo, Long noticiaId, Boolean recomienda);

    /** Lo que votó el usuario en cada una de esas noticias (para «miVoto»). */
    Map<Long, Boolean> misVotos(String correo, List<Long> noticiaIds);
}
