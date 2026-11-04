package com.aldia.dominio.puerto.entrada;

import java.util.List;
import java.util.Map;

import com.aldia.dominio.modelo.CalificacionPropia;

public interface CalificarNoticiaCasoDeUso {

    /** Califica de 1 a 5; si ya había calificado, cambia el valor. */
    CalificacionPropia calificar(String correo, Long noticiaId, Integer valor);

    /** Lo que el usuario le dio a cada una de esas noticias (para «miCalificacion»). */
    Map<Long, Integer> misCalificaciones(String correo, List<Long> noticiaIds);
}
