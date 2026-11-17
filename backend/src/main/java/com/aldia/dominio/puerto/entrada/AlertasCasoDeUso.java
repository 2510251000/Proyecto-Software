package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.Alerta;

public interface AlertasCasoDeUso {

    /** Las alertas vigentes de una ciudad; sin ciudad, las de la ciudad del usuario (o todas si no tiene). */
    List<Alerta> vigentes(String correo, Long ciudadId);

    /** Las alertas vigentes que el usuario todavía no ha visto: las que la app muestra a pantalla completa. */
    List<Alerta.Pendiente> pendientes(String correo);

    /** La alerta de una noticia, si la tiene. */
    Alerta deNoticia(Long noticiaId);

    /** Solo el autor o un administrador pueden darla por terminada. Avisa a la ciudad. */
    Alerta resolver(String correo, Long noticiaId);
}
